import { aiAnalysisQueue } from "./index";
import { generateMeetingSummary } from "../services/gemini";
import { chunkText, generateEmbeddings } from "../services/embeddings";
import { storage } from "../storage";
import { emitToWorkspace } from "../socket";

console.log("[Worker] AI worker is listening for jobs...");

aiAnalysisQueue.process(async (job) => {
  const { meetingId, transcriptText } = job.data;

  try {
    console.log(`\n[🧠 AI WORKER] Picked up job for Meeting: ${meetingId}`);
    
    const dbData = await storage.getMeetingById(meetingId);
    const workspaceId = dbData?.meeting.workspaceId;
    
    // 1. Generate insights using Gemini 1.5 Flash
    console.log(`[🧠 AI WORKER] Generating summary and extracting action items...`);
    const insights = await generateMeetingSummary(transcriptText);

    // 2. Save the summary to the database
    await storage.createSummary({
      meetingId,
      tldr: insights.tldr,
      keyDecisions: insights.keyDecisions,
      followUpEmail: insights.followUpEmail,
    });
    console.log(`[🧠 AI WORKER] Summary saved to DB`);

    // 3. Save action items to database
    if (insights.actionItems && insights.actionItems.length > 0) {
      const itemsToInsert = insights.actionItems.map(item => ({
        meetingId,
        task: item.task,
        owner: item.owner || "Unassigned",
        deadline: item.deadline || "None",
        status: "pending" as const,
      }));
      await storage.createActionItems(itemsToInsert);
      console.log(`[🧠 AI WORKER] ${itemsToInsert.length} action items saved to DB`);
    }

    // 4. Generate Semantic Chunks for Vector Search (RAG)
    console.log(`[🧠 AI WORKER] Generating vector embeddings for RAG...`);
    const chunks = chunkText(transcriptText);
    const vectors = await generateEmbeddings(chunks);
    
    if (chunks.length > 0) {
      const dbChunks = chunks.map((textChunk, index) => ({
        meetingId,
        textChunk,
        embedding: vectors[index],
      }));
      
      await storage.createTranscriptChunks(dbChunks);
      console.log(`[🧠 AI WORKER] Saved ${dbChunks.length} vector embeddings to DB.`);
    }

    // 5. Mark the meeting as 100% ready!
    await storage.updateMeetingStatus(meetingId, "ready");
    if (workspaceId) emitToWorkspace(workspaceId, "meeting_ready", { meetingId, status: "ready" });

    console.log(`[✅ AI WORKER] Successfully processed and extracted insights for Meeting: ${meetingId}\n`);
    
    return { success: true };

  } catch (error: any) {
    console.error(`[❌ AI WORKER] Job failed for Meeting ${meetingId}:`, error);
    await storage.updateMeetingStatus(meetingId, "failed");

    const dbData = await storage.getMeetingById(meetingId);
    if (dbData) emitToWorkspace(dbData.meeting.workspaceId, "meeting_updated", { meetingId, status: "failed" });

    throw error;
  }
});
