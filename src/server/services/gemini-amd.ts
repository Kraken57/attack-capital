import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY not found in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function analyzeAudioWithGemini(audioBuffer: Buffer): Promise<{
  isHuman: boolean;
  confidence: number;
  reasoning: string;
}> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const prompt = `Analyze this audio and determine if it's a human speaking or an answering machine/voicemail.

Consider:
- Human: Natural speech patterns, pauses, conversational tone, "hello", questions
- Machine: Robotic voice, scripted greeting, "leave a message", beep sounds, menu options

Respond in JSON format:
{
  "isHuman": true/false,
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "audio/wav",
          data: audioBuffer.toString("base64"),
        },
      },
    ]);

    const response = result.response.text();
    const parsed = JSON.parse(response.replace(/```json\n?|\n?```/g, ""));

    return {
      isHuman: parsed.isHuman,
      confidence: parsed.confidence,
      reasoning: parsed.reasoning,
    };
  } catch (error) {
    console.error("Gemini AMD error:", error);
    return {
      isHuman: false,
      confidence: 0.5,
      reasoning: "Error analyzing audio",
    };
  }
}
