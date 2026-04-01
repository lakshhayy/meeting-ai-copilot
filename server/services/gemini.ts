import { GoogleGenerativeAI, Schema, SchemaType } from "@google/generative-ai";

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set. AI Summarization will fail.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
// Wow, you have access to the absolute newest models! Upgrading you to gemini-2.5-flash
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export interface MeetingSummaryResult {
  tldr: string;
  keyDecisions: string[];
  followUpEmail: string;
  actionItems: {
    task: string;
    owner: string;
    deadline: string;
  }[];
}

// We force Gemini to return exactly this JSON shape.
const responseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    tldr: {
      type: SchemaType.STRING,
      description: "A short maximum 3 paragraph high-level summary of the entire meeting.",
    },
    keyDecisions: {
      type: SchemaType.ARRAY,
      description: "An array of strings, where each string is a key decision made during the meeting.",
      items: {
        type: SchemaType.STRING,
      },
    },
    followUpEmail: {
      type: SchemaType.STRING,
      description: "A professional, ready-to-send draft of a follow-up email summarizing the meeting for attendees.",
    },
    actionItems: {
      type: SchemaType.ARRAY,
      description: "A list of action items / tasks extracted from the meeting.",
      items: {
        type: SchemaType.OBJECT,
        properties: {
          task: {
            type: SchemaType.STRING,
            description: "The specific task to be done.",
          },
          owner: {
            type: SchemaType.STRING,
            description: "The name of the person assigned to the task, or 'Unassigned' if unclear.",
          },
          deadline: {
            type: SchemaType.STRING,
            description: "When the task is due, e.g., 'Next Tuesday', 'EOD Friday', or 'None' if not specified.",
          },
        },
        required: ["task", "owner", "deadline"],
      },
    },
  },
  required: ["tldr", "keyDecisions", "followUpEmail", "actionItems"],
};

export async function generateMeetingSummary(transcript: string): Promise<MeetingSummaryResult> {
  const prompt = `You are a highly intelligent meeting co-pilot. Your job is to read the attached raw transcript of a meeting and perfectly extract structured information.

Transcript:
"""
${transcript}
"""

Extract the requested outputs matching the required JSON schema. ONLY extract information actually present in the text above. Don't invent tasks or summarize things that were not said.
`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const textPayload = result.response.text();
    if (!textPayload) throw new Error("Gemini returned empty response.");
    
    // Because we use responseSchema, this parse is practically guaranteed to succeed!
    const parsed: MeetingSummaryResult = JSON.parse(textPayload);
    return parsed;
  } catch (error) {
    console.error("[Gemini.generateMeetingSummary] Failed to generate AI insights:", error);
    throw error;
  }
}
