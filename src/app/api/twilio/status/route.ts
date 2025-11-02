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
    const callStatus = formData.get("CallStatus") as string;
    const duration = formData.get("CallDuration") as string;

    const updateData: any = {
      status: callStatus,
    };

    if (duration) {
      updateData.duration = parseInt(duration, 10);
    }

    await db.call.update({
      where: { id: callId },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Status callback error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
