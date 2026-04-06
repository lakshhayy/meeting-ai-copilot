import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { db } from "../db";
import { transcriptChunks } from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import { generateSingleEmbedding } from "../services/embeddings";
import { generateChatResponse } from "../services/gemini";
import { storage } from "../storage";

const router = Router();

// POST /api/chat/:meetingId
router.post("/:meetingId", requireAuth(), async (req, res) => {
  try {
    const dbUser = (req as any).dbUser;
    const meetingId = req.params.meetingId as string;
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "A valid string 'message' is required in the body." });
    }

    // 1. Verify access security
    const meetingData = await storage.getMeetingById(meetingId);
    if (!meetingData) {
      return res.status(404).json({ message: "Meeting not found" });
    }
    
    const member = await storage.getWorkspaceMember(meetingData.meeting.workspaceId, dbUser.id);
    if (!member) {
      return res.status(403).json({ message: "Forbidden - You do not have access to this workspace." });
    }

    // 2. Generate Math Vector (768-D float array) from User's raw text question
    console.log(`[RAG] Encoding question: "${message}"`);
    const queryVector = await generateSingleEmbedding(message);

    // 3. PostgreSQL Vector Similarity Search
    // The `<=>` operator computes cosine distance right inside the Postgres kernel!
    console.log(`[RAG] Performing semantic similarity search...`);
    const relevantChunks = await db
      .select({ textChunk: transcriptChunks.textChunk })
      .from(transcriptChunks)
      .where(eq(transcriptChunks.meetingId, meetingId))
      .orderBy(sql`${transcriptChunks.embedding} <=> ${JSON.stringify(queryVector)}::vector`)
      .limit(5);

    if (relevantChunks.length === 0) {
      return res.json({ text: "This meeting does not have a parsed transcript yet." });
    }

    const chunkTexts = relevantChunks.map(c => c.textChunk);

    // 4. Sythesize Final Response utilizing strictly the context pulled from DB
    console.log(`[RAG] Found ${chunkTexts.length} chunks. Augmenting AI prompt...`);
    const answer = await generateChatResponse(chunkTexts, message);

    return res.json({ text: answer });
  } catch (error: any) {
    console.error("[Chat API] Failed to process RAG chat message:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
