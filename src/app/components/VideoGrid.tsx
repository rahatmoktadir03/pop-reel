"use client";

import Link from "next/link";
import { Heart, MessageCircle, Play, Eye } from "lucide-react";
import { Video } from "./VideoCard";
import { formatDistanceToNow } from "@/utils/time";

type Props = {
  videos: Video[];
  emptyMessage?: string;
};

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// Stable per-user gradient based on userId
function getAvatarGradient(userId: string) {
  const g = [
    "from-pink-500 to-rose-500",
    "from-purple-500 to-pink-500",
    "from-cyan-500 to-blue-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-amber-400",
    "from-indigo-500 to-purple-500",
  ];
  return g[userId.charCodeAt(userId.length - 1) % g.length];
}

export default function VideoGrid({ videos, emptyMessage = "No videos." }: Props) {
  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center">
          <Play className="w-7 h-7 text-zinc-600" />
        </div>
        <div className="text-center">
          <p className="text-zinc-400 font-medium">{emptyMessage}</p>
          <p className="text-zinc-600 text-sm mt-1">Check back soon!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      {videos.map((video) => {
        const avatarGrad = getAvatarGradient(video.userId);
        return (
          <Link key={video.id} href={`/video/${video.id}`} className="group block">
            <div className="relative aspect-[9/16] bg-zinc-900 rounded-2xl overflow-hidden shadow-card group-hover:shadow-card-hover transition-all duration-300">
              {/* Thumbnail / video */}
              {video.thumbnail ? (
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <video
                  src={video.url}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  preload="metadata"
                  muted
                />
              )}

              {/* Base gradient always visible */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 scale-0 group-hover:scale-100 transition-transform duration-300 ease-spring">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                </div>
              </div>

              {/* Top: user avatar */}
              <div className="absolute top-2 left-2">
                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${avatarGrad} p-px shadow-lg`}>
                  <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden flex items-center justify-center">
                    {video.user.avatar ? (
                      <img src={video.user.avatar} alt={video.user.displayName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-[9px] font-bold">
                        {(video.user.displayName[0] ?? "?").toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom info */}
              <div className="absolute bottom-0 left-0 right-0 p-2.5">
                <p className="text-white text-xs font-semibold line-clamp-2 leading-snug mb-1.5 drop-shadow">
                  {video.title}
                </p>
                <div className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-2 text-white/80">
                    <span className="flex items-center gap-0.5">
                      <Heart className="w-3 h-3 fill-pink-400 text-pink-400" />
                      {formatCount(video._count.likes)}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <MessageCircle className="w-3 h-3" />
                      {formatCount(video._count.comments)}
                    </span>
                  </div>
                  <span className="flex items-center gap-0.5 text-zinc-400">
                    <Eye className="w-3 h-3" />
                    {formatCount(video.views)}
                  </span>
                </div>
              </div>
            </div>

            {/* Below card */}
            <div className="mt-1.5 px-0.5">
              <p className="text-zinc-200 text-xs font-medium line-clamp-1">{video.title}</p>
              <p className="text-zinc-500 text-[10px] flex items-center gap-1 mt-0.5">
                <span>@{video.user.username}</span>
                <span>·</span>
                <span>{formatDistanceToNow(new Date(video.createdAt))}</span>
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
