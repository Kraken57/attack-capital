import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

const VoiceResponse = twilio.twiml.VoiceResponse;

export async function GET(req: NextRequest) {
  return NextResponse.json({ message: "Voice webhook endpoint is working" });
}

export async function POST(req: NextRequest) {
  console.log("=== VOICE WEBHOOK CALLED ===");
  console.log("URL:", req.url);
  console.log("Method:", req.method);
  
  const searchParams = req.nextUrl.searchParams;
  const callId = searchParams.get("callId");
  const strategy = searchParams.get("strategy");

  console.log(`Voice webhook called: callId=${callId}, strategy=${strategy}`);

  const twiml = new VoiceResponse();

  if (strategy === "twilio") {
    // For Twilio native AMD, wait for async callback
    twiml.say("Please wait while we connect your call.");
    twiml.pause({ length: 30 });
  } else if (strategy === "gemini" || strategy === "huggingface") {
    // For AI-based AMD, start media stream
    const host = req.headers.get("host");
    const wsUrl = `wss://${host}/api/media-stream?callId=${callId}&strategy=${strategy}`;
    console.log(`Starting media stream to: ${wsUrl}`);
    
    twiml.say("Connecting...");
    const connect = twiml.connect();
    connect.stream({
      url: wsUrl,
    });
  } else if (strategy === "jambonz") {
    // For Jambonz, redirect to Jambonz endpoint
    twiml.say("Connecting via Jambonz...");
    // TODO: Implement Jambonz SIP routing
  }

  const twimlString = twiml.toString();
  console.log(`TwiML response: ${twimlString}`);

  return new NextResponse(twimlString, {
    headers: { "Content-Type": "text/xml" },
  });
}
