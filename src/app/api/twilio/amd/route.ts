import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

export async function POST(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const callId = searchParams.get("callId");

    if (!callId) {
      return NextResponse.json({ error: "Missing callId" }, { status: 400 });
    }

    const formData = await req.formData();
    const amdStatus = formData.get("AnsweredBy") as string;
    const callSid = formData.get("CallSid") as string;

    let amdResult: string;
    let confidence = 0.85; // Twilio doesn't provide confidence, use default

    switch (amdStatus) {
      case "human":
        amdResult = "human";
        break;
      case "machine_start":
      case "machine_end_beep":
      case "machine_end_silence":
      case "machine_end_other":
        amdResult = "machine";
        break;
      default:
        amdResult = "undecided";
        confidence = 0.5;
    }

    // Update call record
    await db.call.update({
      where: { id: callId },
      data: {
        amdResult,
        confidence,
        status: amdResult === "human" ? "answered" : "completed",
        metadata: {
          twilioAmdStatus: amdStatus,
        },
      },
    });

    console.log(`AMD Result for ${callSid}: ${amdResult}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("AMD callback error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
