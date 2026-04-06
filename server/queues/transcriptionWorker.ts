import { transcriptionQueue, aiAnalysisQueue } from "./index";
import { transcribeAudio } from "../services/openai";
import { storage } from "../storage";
import { emitToWorkspace } from "../socket";

console.log("[Worker] Transcription worker is listening for jobs...");

transcriptionQueue.process(async (job) => {
  const { meetingId, audioUrl } = job.data;

  try {
    console.log(`\n[⚙️ WORKER] Picked up job for Meeting: ${meetingId}`);
    
    const dbData = await storage.getMeetingById(meetingId);
    const workspaceId = dbData?.meeting.workspaceId;

    // 1. Update DB to show we are transcribing
    await storage.updateMeetingStatus(meetingId, "transcribing");
    if (workspaceId) emitToWorkspace(workspaceId, "meeting_updated", { meetingId, status: "transcribing" });

    // 2. Do the heavy lifting (Call Groq API)
    const transcriptText = await transcribeAudio(audioUrl);

    // 3. Save the transcript to the database
    await storage.createTranscript(meetingId, transcriptText);

    // 4. Change status and push to AI queue!
    await storage.updateMeetingStatus(meetingId, "analysing");
    if (workspaceId) emitToWorkspace(workspaceId, "meeting_updated", { meetingId, status: "analysing" });
    
    console.log(`[⚙️ WORKER] Transcription complete. Pushing to AI Queue for Meeting: ${meetingId}`);
    // PASS the payload to the next worker
    await aiAnalysisQueue.add({
      meetingId,
      transcriptText
    });

    console.log(`[✅ WORKER] Successfully handed off Meeting: ${meetingId} to AI Queue\n`);
    
    return { success: true };

  } catch (error: any) {
    console.error(`[❌ WORKER] Job failed for Meeting ${meetingId}:`, error);
    await storage.updateMeetingStatus(meetingId, "failed");
    
    const dbData = await storage.getMeetingById(meetingId);
    const workspaceId = dbData?.meeting.workspaceId;
    if (workspaceId) emitToWorkspace(workspaceId, "meeting_updated", { meetingId, status: "failed" });
    
    throw error;
  }
});