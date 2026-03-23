import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { upload } from "../middleware/upload";
import { uploadAudioToCloudinary } from "../services/cloudinary";
import { transcriptionQueue } from "../queues/index";
import { storage } from "../storage";

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

export default router;