import { NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

export async function POST(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const callId = searchParams.get("callId");

    if (!callId) {
      return NextResponse.json({ error: "Missing callId" }, { status: 400 });
    }

    const body = await req.json();
    const { event, call_sid, amd_result } = body;

    console.log(`Jambonz AMD event: ${event}, result: ${amd_result}`);

    let amdResult: string;
    let confidence = 0.90; // Jambonz typically has higher accuracy

    switch (amd_result) {
      case "human":
      case "amd_human_detected":
        amdResult = "human";
        break;
      case "machine":
      case "amd_machine_detected":
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
          jambonzEvent: event,
          jambonzCallSid: call_sid,
          amdResult: amd_result,
        },
      },
    });

    console.log(`Jambonz AMD Result for ${call_sid}: ${amdResult}`);

    // Return TwiML response
    if (amdResult === "human") {
      return NextResponse.json({
        verb: "say",
        text: "Hello! You have been connected.",
      });
    } else {
      return NextResponse.json({
        verb: "hangup",
      });
    }
  } catch (error) {
    console.error("Jambonz AMD callback error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
