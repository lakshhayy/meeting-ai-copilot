import { GoogleGenerativeAI } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set. Embedding generation will fail.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// Accessing the newest v2 embeddings based on the API Key
const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-2-preview" });

/**
 * Splits a massive transcript string into smaller overlapping chunks.
 * We use overlapping chunks so that if a key point is split across the boundary,
 * the AI doesn't lose the context.
 */
export function chunkText(text: string, wordsPerChunk = 150, overlap = 30): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  
  for (let i = 0; i < words.length; i += (wordsPerChunk - overlap)) {
    const chunk = words.slice(i, i + wordsPerChunk).join(" ");
    if (chunk.trim()) {
      chunks.push(chunk);
    }
  }
  
  return chunks;
}

/**
 * Takes an array of text chunks and uses Google's text-embedding-004 model
 * to generate a 768-dimensional float array (vector math) for each chunk.
 */
export async function generateEmbeddings(chunks: string[]): Promise<number[][]> {
  try {
    console.log(`[Embeddings] Calling Gemini API to generate embeddings for ${chunks.length} chunks...`);
    
    // We run the embedding API calls in parallel using Promise.all for massive speed
    const results = await Promise.all(
      chunks.map((chunk) => embeddingModel.embedContent(chunk))
    );
    
    // The Gemini SDK returns the float array in `.embedding.values`
    return results.map((res) => res.embedding.values);
  } catch (error) {
    console.error("[Embeddings] Failed to generate embeddings:", error);
    throw error;
  }
}

/**
 * Utility to generate a single embedding (useful when a user searches a question in the UI)
 */
export async function generateSingleEmbedding(text: string): Promise<number[]> {
  try {
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("[Embeddings] Failed to generate single embedding:", error);
    throw error;
  }
}
