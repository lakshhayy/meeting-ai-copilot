import Queue from "bull";

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

// Initialize the Transcription Queue
// This is the "list" where we will drop new audio files that need processing
export const transcriptionQueue = new Queue("transcription-queue", redisUrl);

// Optional: Initialize the AI Analysis Queue (we'll use this in Week 3)
export const aiAnalysisQueue = new Queue("ai-analysis-queue", redisUrl);

console.log("[Queue] Bull queues initialized and connected to Redis.");