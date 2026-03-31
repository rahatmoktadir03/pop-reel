import { NextRequest, NextResponse } from "next/server";
import { safeAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteFile } from "@/utils/s3";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

const VIDEO_INCLUDE = {
  user: { select: { id: true, username: true, displayName: true, avatar: true } },
  _count: { select: { likes: true, comments: true, saves: true } },
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = await safeAuth();

  try {
    const video = await prisma.video.findUnique({
      where: { id },
      include: VIDEO_INCLUDE,
    });

    if (!video || video.status !== "active") {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const result = {
      ...video,
      tags: JSON.parse(video.tags || "[]"),
      isLiked: false,
      isSaved: false,
      isFollowing: false,
    };

    if (userId) {
      const [like, save, follow] = await Promise.all([
        prisma.like.findUnique({ where: { userId_videoId: { userId, videoId: id } } }),
        prisma.save.findUnique({ where: { userId_videoId: { userId, videoId: id } } }),
        prisma.follow.findUnique({
          where: { followerId_followingId: { followerId: userId, followingId: video.userId } },
        }),
      ]);
      result.isLiked = !!like;
      result.isSaved = !!save;
      result.isFollowing = !!follow;
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/videos/[id]]", err);
    return NextResponse.json({ error: "Failed to fetch video" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = await safeAuth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const video = await prisma.video.findUnique({ where: { id } });
    if (!video) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (video.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.video.delete({ where: { id } });

    // Delete from Uploadthing CDN or local fallback
    if (video.url.includes("utfs.io") || video.url.includes("ufs.sh")) {
      // Extract file key from uploadthing URL: https://utfs.io/f/<key>
      const key = video.url.split("/f/")[1]?.split("?")[0];
      if (key) await utapi.deleteFiles(key).catch(() => {});
    } else {
      await deleteFile(video.url);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/videos/[id]]", err);
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
  }
}
