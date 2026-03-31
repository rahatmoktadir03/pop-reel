import { NextRequest, NextResponse } from "next/server";
import { safeAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VIDEO_INCLUDE = {
  user: { select: { id: true, username: true, displayName: true, avatar: true } },
  _count: { select: { likes: true, comments: true, saves: true } },
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 20);
  const type = searchParams.get("type") || "for_you"; // for_you | following

  const { userId } = await safeAuth();

  try {
    let videoIds: string[] | null = null;

    if (type === "following" && userId) {
      const follows = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      });
      const followingIds = follows.map((f) => f.followingId);
      if (followingIds.length === 0) {
        return NextResponse.json({ videos: [], nextCursor: null });
      }
      const vids = await prisma.video.findMany({
        where: { userId: { in: followingIds }, status: "active" },
        select: { id: true },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : 0,
      });
      videoIds = vids.map((v) => v.id);
    }

    const where = videoIds
      ? { id: { in: videoIds }, status: "active" }
      : { status: "active" };

    const videos = await prisma.video.findMany({
      where,
      include: VIDEO_INCLUDE,
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

    // Enrich with per-user data if authenticated
    let enriched = videos.map((v) => ({
      ...v,
      tags: JSON.parse(v.tags || "[]"),
      isLiked: false,
      isSaved: false,
      isFollowing: false,
    }));

    if (userId) {
      const videoIds = enriched.map((v) => v.id);
      const [likes, saves, follows] = await Promise.all([
        prisma.like.findMany({
          where: { userId, videoId: { in: videoIds } },
          select: { videoId: true },
        }),
        prisma.save.findMany({
          where: { userId, videoId: { in: videoIds } },
          select: { videoId: true },
        }),
        prisma.follow.findMany({
          where: {
            followerId: userId,
            followingId: { in: enriched.map((v) => v.userId) },
          },
          select: { followingId: true },
        }),
      ]);

      const likedSet = new Set(likes.map((l) => l.videoId));
      const savedSet = new Set(saves.map((s) => s.videoId));
      const followingSet = new Set(follows.map((f) => f.followingId));

      enriched = enriched.map((v) => ({
        ...v,
        isLiked: likedSet.has(v.id),
        isSaved: savedSet.has(v.id),
        isFollowing: followingSet.has(v.userId),
      }));
    }

    return NextResponse.json({ videos: enriched, nextCursor });
  } catch (err) {
    console.error("[GET /api/videos]", err);
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId } = await safeAuth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, url, tags, duration } = body;

    if (!title || !url) {
      return NextResponse.json({ error: "Title and URL are required" }, { status: 400 });
    }

    const video = await prisma.video.create({
      data: {
        title: title.trim(),
        description: description?.trim() || "",
        url,
        tags: JSON.stringify(
          Array.isArray(tags) ? tags.slice(0, 10) : []
        ),
        duration: duration || 0,
        userId,
      },
      include: VIDEO_INCLUDE,
    });

    return NextResponse.json({ ...video, tags: JSON.parse(video.tags) }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/videos]", err);
    return NextResponse.json({ error: "Failed to create video" }, { status: 500 });
  }
}
