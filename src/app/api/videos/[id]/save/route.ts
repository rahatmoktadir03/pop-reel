import { NextRequest, NextResponse } from "next/server";
import { safeAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: videoId } = await params;
  const { userId } = await safeAuth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await getOrCreateUser();

    const existing = await prisma.save.findUnique({
      where: { userId_videoId: { userId, videoId } },
    });

    if (existing) {
      await prisma.save.delete({ where: { id: existing.id } });
    } else {
      await prisma.save.create({ data: { userId, videoId } });
    }

    return NextResponse.json({ saved: !existing });
  } catch (err) {
    console.error("[POST /api/videos/[id]/save]", err);
    return NextResponse.json({ error: "Failed to toggle save" }, { status: 500 });
  }
}
