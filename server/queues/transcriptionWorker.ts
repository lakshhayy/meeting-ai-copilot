import { transcriptionQueue } from "./index";

console.log("[Worker] Transcription worker is listening for jobs...");

// The `.process` function is an active listener. 
// It will automatically grab jobs as soon as they are added to the queue.
transcriptionQueue.process(async (job) => {
  // We expect the job to pass us the meeting ID and the Cloudinary URL
  const { meetingId, audioUrl } = job.data;

  console.log(`\n[⚙️ WORKER] Picked up job for Meeting: ${meetingId}`);
  console.log(`[⚙️ WORKER] Downloading audio from: ${audioUrl}`);

  // TODO (Chunk 2.5): Call OpenAI Whisper API here!
  // For now, we simulate a 3-second delay to mimic transcription time.
  await new Promise((resolve) => setTimeout(resolve, 3000));

  console.log(`[✅ WORKER] Successfully processed Meeting: ${meetingId}\n`);

  // Returning a value marks the job as successfully completed in Bull
  return { 
    success: true, 
    transcript: "This is a dummy transcript that will be replaced by Whisper AI later." 
  };
});

// Event listeners for debugging
transcriptionQueue.on("completed", (job) => {
  console.log(`[Queue] Job ${job.id} completed!`);
});

transcriptionQueue.on("failed", (job, err) => {
  console.error(`[Queue] Job ${job.id} failed with error:`, err.message);
});