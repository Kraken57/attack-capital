import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { initiateTwilioCall } from "~/server/services/twilio";

const dialSchema = z.object({
  targetNumber: z.string().min(10),
  amdStrategy: z.enum(["twilio", "jambonz", "huggingface", "gemini"]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetNumber, amdStrategy } = dialSchema.parse(body);

    // TODO: Get userId from session (Better-Auth)
    const userId = "temp-user-id"; // Placeholder for now

    // Create call record
    const call = await db.call.create({
      data: {
        userId,
        targetNumber,
        amdStrategy,
        status: "initiated",
      },
    });

    // Initiate Twilio call based on strategy
    const twilioCall = await initiateTwilioCall({
      callId: call.id,
      targetNumber,
      amdStrategy,
    });

    // Update call with Twilio SID
    await db.call.update({
      where: { id: call.id },
      data: { twilioCallSid: twilioCall.sid, status: "ringing" },
    });

    return NextResponse.json({
      success: true,
      callId: call.id,
      callSid: twilioCall.sid,
    });
  } catch (error) {
    console.error("Dial error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to initiate call" },
      { status: 500 }
    );
  }
}
