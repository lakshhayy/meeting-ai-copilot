import { transcriptionQueue } from "./index";
import { transcribeAudio } from "../services/openai";
import { storage } from "../storage";

console.log("[Worker] Transcription worker is listening for jobs...");

transcriptionQueue.process(async (job) => {
  const { meetingId, audioUrl } = job.data;

  try {
    console.log(`\n[⚙️ WORKER] Picked up job for Meeting: ${meetingId}`);
    
    // 1. Update DB to show we are transcribing
    await storage.updateMeetingStatus(meetingId, "transcribing");

    // 2. Do the heavy lifting (Call Groq API)
    const transcriptText = await transcribeAudio(audioUrl);

    // 3. Save the transcript to the database
    await storage.createTranscript(meetingId, transcriptText);

    // 4. Mark the meeting as ready
    await storage.updateMeetingStatus(meetingId, "ready");

    console.log(`[✅ WORKER] Successfully processed Meeting: ${meetingId}\n`);
    
    return { success: true };

  } catch (error: any) {
    console.error(`[❌ WORKER] Job failed for Meeting ${meetingId}:`, error);
    await storage.updateMeetingStatus(meetingId, "failed");
    throw error;
  }
});