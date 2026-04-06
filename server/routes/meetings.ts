import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { upload } from "../middleware/upload";
import { uploadAudioToCloudinary } from "../services/cloudinary";
import { transcriptionQueue, aiAnalysisQueue } from "../queues/index";
import { storage } from "../storage";
import fs from "fs";
import { db } from "../db";
import { meetings, transcripts, workspaceMembers } from "../../shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

// POST /api/meetings/upload
// The "upload.single('audio')" middleware catches the file from the frontend
router.post("/upload", requireAuth(), upload.single("audio"), async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    if (!dbUser) return res.status(401).json({ message: "Unauthorized" });

    // 1. Get the text fields sent alongside the file
    const { workspaceId, title } = req.body;
    
    if (!workspaceId || !title) {
      return res.status(400).json({ message: "workspaceId and title are required" });
    }

    // 2. Ensure a file was actually uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No audio file provided" });
    }

    // 3. Verify user has access to this workspace
    const member = await storage.getWorkspaceMember(workspaceId, dbUser.id);
    if (!member) {
      return res.status(403).json({ message: "Forbidden - You do not have access to this workspace" });
    }

    console.log(`[Upload] Uploading ${req.file.originalname} to Cloudinary...`);
    
    // 4. Upload the local temp file to Cloudinary
    const audioUrl = await uploadAudioToCloudinary(req.file.path);

    // 5. Create the meeting row in our Postgres Database
    const meeting = await storage.createMeeting({
      workspaceId,
      uploadedBy: dbUser.id,
      title,
      audioUrl,
      status: "uploading", // Initial status
    });

    console.log(`[Upload] Meeting ${meeting.id} created in DB. Pushing to queue...`);

    // 6. Push the heavy transcription job to our Bull Queue (The Chef)
    await transcriptionQueue.add({
      meetingId: meeting.id,
      audioUrl: meeting.audioUrl
    });

    // 7. Instantly return the meeting data to the user so the UI can show a loading state
    return res.status(201).json(meeting);

  } catch (error: any) {
    console.error("[Upload] Error processing upload:", error);
    return res.status(500).json({ message: error.message || "Internal server error during upload" });
  }
});

// GET /api/meetings/workspace/:workspaceId
// Fetches all meetings for a specific workspace
router.get("/workspace/:workspaceId", requireAuth(), async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const workspaceIdParam = req.params.workspaceId;
    if (Array.isArray(workspaceIdParam)) {
      return res.status(400).json({ message: "Invalid workspace id" });
    }

    // Check access
    const member = await storage.getWorkspaceMember(workspaceIdParam, dbUser.id);
    if (!member) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const workspaceMeetings = await storage.getMeetingsByWorkspace(workspaceIdParam);
    res.json(workspaceMeetings);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /api/meetings/:id
router.get("/:id", requireAuth(), async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const meetingId = req.params.id as string;
    
    const result = await storage.getMeetingById(meetingId);
    if (!result) return res.status(404).json({ message: "Meeting not found" });

    // Verify workspace access
    const member = await storage.getWorkspaceMember(result.meeting.workspaceId, dbUser.id);
    if (!member) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE /api/meetings/:id
router.delete("/:id", requireAuth(), async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const meetingId = req.params.id as string;
    
    // First, verify meeting exists and get workspaceId
    const result = await storage.getMeetingById(meetingId);
    if (!result) return res.status(404).json({ message: "Meeting not found" });

    // Verify workspace access
    const member = await storage.getWorkspaceMember(result.meeting.workspaceId, dbUser.id);
    if (!member || member.role !== "admin") { // Require admin to delete meeting
      return res.status(403).json({ message: "Forbidden - Requires admin role to delete meeting" });
    }

    await storage.deleteMeeting(meetingId);
    res.status(204).send();
  } catch (error) {
    console.error("[Delete Meeting]", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// PATCH /api/meetings/:id
router.patch("/:id", requireAuth(), async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const meetingId = req.params.id as string;
    const { title } = req.body;

    if (!title || typeof title !== "string") {
      return res.status(400).json({ message: "Invalid meeting title" });
    }
    
    const result = await storage.getMeetingById(meetingId);
    if (!result) return res.status(404).json({ message: "Meeting not found" });

    const member = await storage.getWorkspaceMember(result.meeting.workspaceId, dbUser.id);
    if (!member) { 
      return res.status(403).json({ message: "Forbidden - You do not have access to this workspace" });
    }

    await storage.updateMeetingTitle(meetingId, title);
    res.json({ success: true });
  } catch (error) {
    console.error("[Rename Meeting]", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// CHUNK 8.2: LIVE EXTENSION CHUNK HANDLER
import { transcribeLocalAudio } from "../services/openai";
import { emitToWorkspace } from "../socket";

router.post("/workspace/:workspaceId/stream-chunk", upload.single("audio"), async (req, res) => {
  const workspaceIdStr = req.params.workspaceId as string;
  const { sessionId } = req.body;

  if (!req.file) {
    return res.status(400).json({ message: "No audio blob found" });
  }

  try {
    const webmPath = req.file.path + ".webm";
    fs.renameSync(req.file.path, webmPath);

    const transcriptText = await transcribeLocalAudio(webmPath);
    
    if (transcriptText.trim()) {
      // 2A. Find or Create the Live Meeting locally using sessionId
      const member = await db.select().from(workspaceMembers).where(eq(workspaceMembers.workspaceId, workspaceIdStr)).limit(1);
      const userId = member[0]?.userId;

      if (!userId) {
        console.error("Workspace has no members, cannot assign live meeting!");
      } else {
        let meetingMatch = await db.select().from(meetings).where(eq(meetings.audioUrl, sessionId)).limit(1);
        let meetingRow;
        
        if (meetingMatch.length === 0) {
          console.log("[Groq Live Local] Creating new Live Meeting row in DB...");
          const [newMeeting] = await db.insert(meetings).values({
            workspaceId: workspaceIdStr,
            uploadedBy: userId,
            title: "Live Tab Audio " + new Date().toLocaleTimeString(),
            audioUrl: sessionId, // Hack: using audioUrl field to store the sessionId during live recording
            status: "ready"      // Keep 'ready' so it shows up cleanly, we'll manually fire AI Worker when recording stops
          }).returning();
          
          meetingRow = newMeeting;
          await db.insert(transcripts).values({ meetingId: meetingRow.id, rawText: transcriptText });
        } else {
          meetingRow = meetingMatch[0];
          const [existingRaw] = await db.select().from(transcripts).where(eq(transcripts.meetingId, meetingRow.id));
          if (existingRaw) {
             await db.update(transcripts)
                .set({ rawText: existingRaw.rawText + " " + transcriptText })
                .where(eq(transcripts.meetingId, meetingRow.id));
          }
        }
      }

      // 2B. Emit safely over WebSockets
      emitToWorkspace(workspaceIdStr, "meeting:live_transcript_chunk", {
        workspaceId: workspaceIdStr,
        text: transcriptText.trim()
      });
    }

    return res.status(200).json({ success: true, text: transcriptText });
  } catch (err: any) {
    console.error("[Extension Route Error]", err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;