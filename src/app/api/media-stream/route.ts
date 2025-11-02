import { NextRequest } from "next/server";
import { WebSocketServer } from "ws";
import { db } from "~/server/db";
import { analyzeAudioWithGemini } from "~/server/services/gemini-amd";

export const dynamic = "force-dynamic";

// This needs to be handled differently in Next.js
// We'll create a separate WebSocket server
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const callId = searchParams.get("callId");
  const strategy = searchParams.get("strategy");

  if (!callId || !strategy) {
    return new Response("Missing callId or strategy", { status: 400 });
  }

  // Return upgrade required - actual WebSocket handling needs custom server
  return new Response("WebSocket endpoint - use custom server", {
    status: 426,
    headers: {
      Upgrade: "websocket",
    },
  });
}
