const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { WebSocketServer } = require("ws");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  // WebSocket server for media streams
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (request, socket, head) => {
    console.log("Upgrade request received:", request.url);
    const { pathname } = new URL(request.url, `http://${request.headers.host}`);
    console.log("Pathname:", pathname);
    
    if (pathname === "/api/media-stream") {
      console.log("Handling media stream upgrade");
      wss.handleUpgrade(request, socket, head, (ws) => {
        const url = new URL(request.url, `http://${request.headers.host}`);
        handleMediaStream(ws, url.searchParams);
      });
    } else {
      console.log("Destroying socket - not media stream, path:", pathname);
      socket.destroy();
    }
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});

async function handleMediaStream(ws, searchParams) {
  const callId = searchParams.get("callId");
  const strategy = searchParams.get("strategy");

  if (!callId || !strategy) {
    ws.close(1008, "Missing callId or strategy");
    return;
  }

  console.log(`Media stream connected: ${callId} (${strategy})`);

  let audioBuffer = [];
  const BUFFER_SIZE = 8000 * 3; // 3 seconds at 8kHz

  ws.on("message", async (message) => {
    try {
      const msg = JSON.parse(message.toString());

      switch (msg.event) {
        case "connected":
          console.log(`Twilio connected for call ${callId}`);
          break;

        case "start":
          console.log(`Stream started: ${msg.start.streamSid}`);
          break;

        case "media":
          const audioChunk = Buffer.from(msg.media.payload, "base64");
          audioBuffer.push(audioChunk);

          const totalSize = audioBuffer.reduce((sum, buf) => sum + buf.length, 0);
          if (totalSize >= BUFFER_SIZE) {
            console.log(`Processing ${totalSize} bytes of audio with ${strategy}`);
            
            // Simulate AMD detection (replace with actual Gemini/HF call)
            const isHuman = Math.random() > 0.3; // 70% human detection rate
            const confidence = 0.75 + Math.random() * 0.2; // 75-95%
            
            console.log(`AMD Result (${strategy}): ${isHuman ? "human" : "machine"} (confidence: ${confidence.toFixed(2)})`);

            // Update database using dynamic import
            try {
              const { db } = await import("./dist/server/db.js");
              await db.call.update({
                where: { id: callId },
                data: {
                  amdResult: isHuman ? "human" : "machine",
                  confidence: confidence,
                  status: isHuman ? "answered" : "completed",
                  metadata: { strategy, processed: true },
                },
              });
              console.log(`Database updated for call ${callId}`);
            } catch (dbError) {
              console.error("Database update error:", dbError);
            }

            if (!isHuman) {
              ws.send(JSON.stringify({ event: "stop" }));
              ws.close();
            }

            audioBuffer = [];
          }
          break;

        case "stop":
          console.log("Stream stopped");
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
}
