import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const tag = searchParams.get("tag")?.trim() || "";
  const cursor = searchParams.get("cursor");
  const limit = 12;

  if (!q && !tag) {
    return NextResponse.json({ videos: [], nextCursor: null });
  }

  try {
    const where: Record<string, unknown> = { status: "active" };

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { tags: { contains: q } },
        { user: { username: { contains: q } } },
        { user: { displayName: { contains: q } } },
      ];
    } else if (tag) {
      where.tags = { contains: tag };
    }

    const videos = await prisma.video.findMany({
      where,
      include: {
        user: { select: { id: true, username: true, displayName: true, avatar: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: [{ views: "desc" }, { createdAt: "desc" }],
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
    console.error("[GET /api/search]", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
