import { NextResponse } from "next/server";
import { db } from "~/server/db";

export async function GET() {
  try {
    // TODO: Filter by userId from session
    const calls = await db.call.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ calls });
  } catch (error) {
    console.error("Failed to fetch calls:", error);
    return NextResponse.json(
      { error: "Failed to fetch calls" },
      { status: 500 }
    );
  }
}
