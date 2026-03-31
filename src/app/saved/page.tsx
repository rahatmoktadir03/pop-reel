import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import VideoGrid from "../components/VideoGrid";
import { Bookmark } from "lucide-react";

export default async function SavedPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const saves = await prisma.save.findMany({
    where: { userId },
    include: {
      video: {
        include: {
          user: { select: { id: true, username: true, displayName: true, avatar: true } },
          _count: { select: { likes: true, comments: true, saves: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 48,
  });

  const videos = saves.map((s) => ({
    ...s.video,
    tags: JSON.parse(s.video.tags || "[]"),
    isLiked: false,
    isSaved: true,
    isFollowing: false,
  }));

  return (
    <div className="min-h-screen bg-black px-4 pt-6 pb-24 md:pb-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Bookmark className="w-6 h-6 text-yellow-400 fill-yellow-400" />
        <h1 className="text-white text-2xl font-black">Saved Videos</h1>
        <span className="text-zinc-500 text-sm font-normal">({videos.length})</span>
      </div>
      {/* @ts-expect-error - video type compatibility */}
      <VideoGrid videos={videos} emptyMessage="No saved videos yet. Tap 🔖 on a video to save it." />
    </div>
  );
}
