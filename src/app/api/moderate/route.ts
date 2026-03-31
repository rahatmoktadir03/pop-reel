import { NextRequest, NextResponse } from "next/server";
import { safeAuth } from "@/lib/auth";
import { moderateContent } from "@/utils/googleVision";

export async function POST(req: NextRequest) {
  const { userId } = await safeAuth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { frame } = await req.json();
    if (!frame) return NextResponse.json({ safe: true });

    const base64Data = frame.replace(/^data:image\/[a-z]+;base64,/, "");
    const result = await moderateContent(base64Data);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[POST /api/moderate]", err);
    // Don't block uploads if moderation fails
    return NextResponse.json({ safe: true });
  }
}
