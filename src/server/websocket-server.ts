import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { db } from "./db";
import { analyzeAudioWithGemini } from "./services/gemini-amd";

const SAMPLE_RATE = 8000; // Twilio uses 8kHz
const BUFFER_SIZE = 8000 * 3; // 3 seconds of audio

export function createMediaStreamServer(server: any) {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request: IncomingMessage, socket: any, head: Buffer) => {
    const url = new URL(request.url!, `http://${request.headers.host}`);
    
    if (url.pathname === "/api/media-stream") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    }
  });

  wss.on("connection", async (ws: WebSocket, request: IncomingMessage) => {
    const url = new URL(request.url!, `http://${request.headers.host}`);
    const callId = url.searchParams.get("callId");
    const strategy = url.searchParams.get("strategy");

    if (!callId || !strategy) {
      ws.close(1008, "Missing callId or strategy");
      return;
    }

    console.log(`Media stream connected: ${callId} (${strategy})`);

    let audioBuffer: Buffer[] = [];
    let streamSid: string | null = null;

    ws.on("message", async (message: Buffer) => {
      try {
        const msg = JSON.parse(message.toString());

        switch (msg.event) {
          case "connected":
            console.log(`Twilio connected for call ${callId}`);
            break;

          case "start":
            streamSid = msg.start.streamSid;
            console.log(`Stream started: ${streamSid}`);
            break;

          case "media":
            // Twilio sends base64 encoded mulaw audio
            const audioChunk = Buffer.from(msg.media.payload, "base64");
            audioBuffer.push(audioChunk);

            // Process when we have enough audio (3 seconds)
            const totalSize = audioBuffer.reduce((sum, buf) => sum + buf.length, 0);
            if (totalSize >= BUFFER_SIZE) {
              const combinedBuffer = Buffer.concat(audioBuffer);
              
              // Analyze with appropriate strategy
              let result;
              if (strategy === "gemini") {
                result = await analyzeAudioWithGemini(combinedBuffer);
              } else if (strategy === "huggingface") {
                // TODO: Call Python service
                result = { isHuman: false, confidence: 0.5, reasoning: "HF not implemented" };
              }

              if (result) {
                // Update database
                await db.call.update({
                  where: { id: callId },
                  data: {
                    amdResult: result.isHuman ? "human" : "machine",
                    confidence: result.confidence,
                    status: result.isHuman ? "answered" : "completed",
                    metadata: {
                      strategy,
                      reasoning: result.reasoning,
                    },
                  },
                });

                console.log(`AMD Result (${strategy}): ${result.isHuman ? "human" : "machine"} (${result.confidence})`);

                // If machine, hang up
                if (!result.isHuman) {
                  ws.send(JSON.stringify({
                    event: "stop",
                    streamSid,
                  }));
                  ws.close();
                }
              }

              // Clear buffer
              audioBuffer = [];
            }
            break;

          case "stop":
            console.log(`Stream stopped: ${streamSid}`);
            break;
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      console.log(`Media stream closed for call ${callId}`);
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  return wss;
}
