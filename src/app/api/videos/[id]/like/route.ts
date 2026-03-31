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

    const existing = await prisma.like.findUnique({
      where: { userId_videoId: { userId, videoId } },
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
    } else {
      await prisma.like.create({ data: { userId, videoId } });
    }

    const likeCount = await prisma.like.count({ where: { videoId } });
    return NextResponse.json({ liked: !existing, likeCount });
  } catch (err) {
    console.error("[POST /api/videos/[id]/like]", err);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}
