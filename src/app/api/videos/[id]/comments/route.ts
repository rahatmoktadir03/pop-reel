import { NextRequest, NextResponse } from "next/server";
import { safeAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: videoId } = await params;
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = 20;

  try {
    const comments = await prisma.comment.findMany({
      where: { videoId },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatar: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
    });

    let nextCursor: string | null = null;
    if (comments.length > limit) {
      nextCursor = comments[limit].id;
      comments.splice(limit);
    }

    return NextResponse.json({ comments, nextCursor });
  } catch (err) {
    console.error("[GET /api/videos/[id]/comments]", err);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }
}

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

    const { text } = await req.json();
    if (!text?.trim()) {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: { text: text.trim(), userId, videoId },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatar: true } },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (err) {
    console.error("[POST /api/videos/[id]/comments]", err);
    return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
  }
}
