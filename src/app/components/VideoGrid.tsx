"use client";

import Link from "next/link";
import { Heart, MessageCircle, Play } from "lucide-react";
import { Video } from "./VideoCard";
import { formatDistanceToNow } from "@/utils/time";

type Props = {
  videos: Video[];
  emptyMessage?: string;
};

export default function VideoGrid({ videos, emptyMessage = "No videos." }: Props) {
  if (videos.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-500">
        <Play className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      {videos.map((video) => (
        <Link key={video.id} href={`/video/${video.id}`} className="group block">
          <div className="relative aspect-[9/16] bg-zinc-900 rounded-xl overflow-hidden">
            {video.thumbnail ? (
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={video.url}
                className="w-full h-full object-cover"
                preload="metadata"
                muted
              />
            )}

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Play className="w-10 h-10 text-white fill-white" />
            </div>

            {/* Stats overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 p-2">
              <div className="flex items-center gap-2 text-white text-xs">
                <span className="flex items-center gap-0.5">
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  {video._count.likes}
                </span>
                <span className="flex items-center gap-0.5">
                  <MessageCircle className="w-3.5 h-3.5" />
                  {video._count.comments}
                </span>
              </div>
            </div>
          </div>
          <p className="text-zinc-300 text-xs mt-1 truncate">{video.title}</p>
          <p className="text-zinc-600 text-[10px]">
            {formatDistanceToNow(new Date(video.createdAt))}
          </p>
        </Link>
      ))}
    </div>
  );
}
