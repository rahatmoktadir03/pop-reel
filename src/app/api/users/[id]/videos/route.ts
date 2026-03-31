import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userId } = await params;
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const tab = searchParams.get("tab") || "videos"; // videos | saved
  const limit = 12;

  try {
    if (tab === "saved") {
      const saves = await prisma.save.findMany({
        where: { userId },
        include: {
          video: {
            include: {
              user: { select: { id: true, username: true, displayName: true, avatar: true } },
              _count: { select: { likes: true, comments: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
      });

      let nextCursor: string | null = null;
      if (saves.length > limit) {
        nextCursor = saves[limit].id;
        saves.splice(limit);
      }

      const videos = saves.map((s) => ({
        ...s.video,
        tags: JSON.parse(s.video.tags || "[]"),
      }));

      return NextResponse.json({ videos, nextCursor });
    }

    const videos = await prisma.video.findMany({
      where: { userId, status: "active" },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatar: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
    });

    let nextCursor: string | null = null;
    if (videos.length > limit) {
      nextCursor = videos[limit].id;
      videos.splice(limit);
    }

    return NextResponse.json({
      videos: videos.map((v) => ({ ...v, tags: JSON.parse(v.tags || "[]") })),
      nextCursor,
    });
  } catch (err) {
    console.error("[GET /api/users/[id]/videos]", err);
    return NextResponse.json({ error: "Failed to fetch user videos" }, { status: 500 });
  }
}
