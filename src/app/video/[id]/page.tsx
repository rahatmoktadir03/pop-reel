import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import VideoFeed from "../../components/VideoFeed";

export default async function VideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();

  const video = await prisma.video.findUnique({
    where: { id, status: "active" },
    include: {
      user: { select: { id: true, username: true, displayName: true, avatar: true } },
      _count: { select: { likes: true, comments: true, saves: true } },
    },
  });

  if (!video) notFound();

  let isLiked = false;
  let isSaved = false;
  let isFollowing = false;

  if (userId) {
    const [like, save, follow] = await Promise.all([
      prisma.like.findUnique({ where: { userId_videoId: { userId, videoId: id } } }),
      prisma.save.findUnique({ where: { userId_videoId: { userId, videoId: id } } }),
      prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: userId, followingId: video.userId } },
      }),
    ]);
    isLiked = !!like;
    isSaved = !!save;
    isFollowing = !!follow;
  }

  const videoData = {
    ...video,
    createdAt: video.createdAt.toISOString(),
    tags: JSON.parse(video.tags || "[]"),
    isLiked,
    isSaved,
    isFollowing,
  };

  return (
    <VideoFeed
      initialVideos={[videoData]}
      fetchUrl="/api/recommendations"
    />
  );
}
