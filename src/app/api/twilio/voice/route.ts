import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

const VoiceResponse = twilio.twiml.VoiceResponse;

export async function POST(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const callId = searchParams.get("callId");
  const strategy = searchParams.get("strategy");

  const twiml = new VoiceResponse();

  if (strategy === "twilio") {
    // For Twilio native AMD, wait for async callback
    twiml.say("Please wait while we connect your call.");
    twiml.pause({ length: 30 });
  } else if (strategy === "gemini" || strategy === "huggingface") {
    // For AI-based AMD, start media stream
    twiml.say("Connecting...");
    const connect = twiml.connect();
    connect.stream({
      url: `wss://${req.headers.get("host")}/api/media-stream?callId=${callId}&strategy=${strategy}`,
    });
  } else if (strategy === "jambonz") {
    // For Jambonz, redirect to Jambonz endpoint
    twiml.say("Connecting via Jambonz...");
    // TODO: Implement Jambonz SIP routing
  }

  return new NextResponse(twiml.toString(), {
    headers: { "Content-Type": "text/xml" },
  });
}
