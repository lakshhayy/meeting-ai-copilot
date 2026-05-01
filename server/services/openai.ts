import OpenAI, { toFile } from "openai";
import fs from "fs";
import path from "path";
import os from "os";

// We initialize the OpenAI SDK, but point it directly at Groq's free servers!
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function transcribeAudio(audioUrl: string): Promise<string> {
  let tempFilePath = "";
  
  try {
    console.log(`[Groq] Downloading audio from Cloudinary for transcription...`);
    
    // 1. Fetch the audio file from Cloudinary
    const response = await fetch(audioUrl);
    if (!response.ok) throw new Error(`Failed to fetch audio: ${response.statusText}`);
    
    // 2. Save it temporarily to the server's disk
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    tempFilePath = path.join(os.tmpdir(), `transcribe-${Date.now()}.mp3`);
    fs.writeFileSync(tempFilePath, buffer);

    console.log(`[Groq] Audio downloaded. Sending to Groq Whisper API...`);

    // 3. Send the file to Groq's Whisper Turbo model
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempFilePath),
      model: "whisper-large-v3", // Switched to large-v3 for better multilingual (Hindi) support
      response_format: "text",
      temperature: 0.0, // Low temperature reduces hallucinations
      prompt: "This is a meeting transcript. The conversation may be in English or Hindi (Hinglish). नमस्ते, आप कैसे हैं? Please transcribe accurately.",
    });

    console.log(`[Groq] Transcription successful!`);
    
    return transcription as unknown as string;

  } catch (error) {
    console.error("[Groq] Transcription error:", error);
    throw error;
  } finally {
    // ALWAYS clean up the temporary file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
}

export async function transcribeLocalAudio(localFilePath: string): Promise<string> {
  try {
    console.log(`[Groq Live Local] Transcribing 10s chunk...`);
    const transcription = await openai.audio.transcriptions.create({
      file: await toFile(fs.createReadStream(localFilePath), "chunk.webm"),
      model: "whisper-large-v3",
      response_format: "text",
      temperature: 0.0, // Low temperature reduces hallucinations on silent chunks
      prompt: "This is a meeting transcript. The conversation may be in English or Hindi (Hinglish). नमस्ते, आप कैसे हैं? Please transcribe accurately.",
    });
    return transcription as unknown as string;
  } catch (error) {
    console.error("[Groq Live Local] Transcription error:", error);
    throw error;
  } finally {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
  }
}