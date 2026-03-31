"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Volume2,
  VolumeX,
  Play,
  MoreVertical,
  Trash2,
} from "lucide-react";
import clsx from "clsx";
import toast from "react-hot-toast";
import CommentDrawer from "./CommentDrawer";

export type Video = {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string | null;
  tags: string[];
  views: number;
  duration: number;
  createdAt: string;
  userId: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar: string | null;
  };
  _count: {
    likes: number;
    comments: number;
    saves: number;
  };
  isLiked: boolean;
  isSaved: boolean;
  isFollowing: boolean;
};

type Props = {
  video: Video;
  isActive: boolean;
  globalMuted: boolean;
  onMuteToggle: () => void;
  onDelete?: (id: string) => void;
};

export default function VideoCard({
  video,
  isActive,
  globalMuted,
  onMuteToggle,
  onDelete,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user, isSignedIn } = useUser();
  const router = useRouter();

  const [liked, setLiked] = useState(video.isLiked);
  const [likeCount, setLikeCount] = useState(video._count.likes);
  const [saved, setSaved] = useState(video.isSaved);
  const [following, setFollowing] = useState(video.isFollowing);
  const [playing, setPlaying] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(video._count.comments);
  const [showMenu, setShowMenu] = useState(false);

  // Play/pause based on visibility
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (isActive) {
      // Wait until the browser has enough data before calling play()
      if (el.readyState >= 2) {
        el.play().catch(() => {});
      } else {
        const onCanPlay = () => el.play().catch(() => {});
        el.addEventListener("canplay", onCanPlay, { once: true });
        return () => el.removeEventListener("canplay", onCanPlay);
      }
    } else {
      el.pause();
    }
  }, [isActive]);

  // Sync mute state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = globalMuted;
    }
  }, [globalMuted]);

  // Record view when video becomes active
  useEffect(() => {
    if (!isActive) return;
    const timer = setTimeout(() => {
      fetch(`/api/videos/${video.id}/view`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ watchTime: 3 }),
      }).catch(() => {});
    }, 3000);
    return () => clearTimeout(timer);
  }, [isActive, video.id]);

  const requireAuth = useCallback(
    (action: () => void) => {
      if (!isSignedIn) {
        toast("Sign in to interact with videos", { icon: "🔒" });
        router.push("/sign-in");
        return;
      }
      action();
    },
    [isSignedIn, router]
  );

  const handleLike = () =>
    requireAuth(async () => {
      const prev = liked;
      setLiked(!liked);
      setLikeCount((c) => c + (liked ? -1 : 1));
      try {
        const res = await fetch(`/api/videos/${video.id}/like`, { method: "POST" });
        const data = await res.json();
        setLiked(data.liked);
        setLikeCount(data.likeCount);
      } catch {
        setLiked(prev);
        setLikeCount((c) => c + (prev ? 1 : -1));
        toast.error("Failed to like");
      }
    });

  const handleSave = () =>
    requireAuth(async () => {
      const prev = saved;
      setSaved(!saved);
      try {
        const res = await fetch(`/api/videos/${video.id}/save`, { method: "POST" });
        const data = await res.json();
        setSaved(data.saved);
        toast.success(data.saved ? "Saved!" : "Removed from saved");
      } catch {
        setSaved(prev);
        toast.error("Failed to save");
      }
    });

  const handleFollow = () =>
    requireAuth(async () => {
      const prev = following;
      setFollowing(!following);
      try {
        const res = await fetch(`/api/users/${video.userId}/follow`, { method: "POST" });
        const data = await res.json();
        setFollowing(data.following);
      } catch {
        setFollowing(prev);
        toast.error("Failed to follow");
      }
    });

  const handleShare = async () => {
    const url = `${window.location.origin}/video/${video.id}`;
    if (navigator.share) {
      await navigator.share({ title: video.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this video?")) return;
    try {
      await fetch(`/api/videos/${video.id}`, { method: "DELETE" });
      toast.success("Video deleted");
      onDelete?.(video.id);
    } catch {
      toast.error("Failed to delete");
    }
  };

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play();
    } else {
      el.pause();
    }
  };

  const isOwner = user?.id === video.userId;

  return (
    <>
      <div className="relative w-full h-screen bg-black flex items-center justify-center snap-start overflow-hidden">
        {/* Video */}
        <video
          ref={videoRef}
          src={video.url}
          loop
          playsInline
          muted={globalMuted}
          className="w-full h-full object-contain"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => {/* suppress media errors from Next.js dev overlay */}}
          onClick={togglePlay}
        />

        {/* Pause indicator */}
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black/40 rounded-full p-4">
              <Play className="w-12 h-12 text-white fill-white" />
            </div>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/70 via-transparent to-black/20" />

        {/* Right actions */}
        <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5">
          {/* Avatar + Follow */}
          <div className="flex flex-col items-center gap-1">
            <Link href={`/profile/${video.userId}`}>
              <div className="w-12 h-12 rounded-full bg-zinc-700 overflow-hidden border-2 border-white">
                {video.user.avatar ? (
                  <img
                    src={video.user.avatar}
                    alt={video.user.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                    {video.user.displayName[0]?.toUpperCase()}
                  </div>
                )}
              </div>
            </Link>
            {!isOwner && (
              <button
                onClick={handleFollow}
                className={clsx(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors",
                  following
                    ? "border-zinc-400 text-zinc-400"
                    : "border-pink-500 text-pink-500"
                )}
              >
                {following ? "Following" : "+ Follow"}
              </button>
            )}
          </div>

          {/* Like */}
          <ActionButton
            icon={
              <Heart
                className={clsx("w-7 h-7", liked ? "fill-pink-500 text-pink-500" : "text-white")}
              />
            }
            label={formatCount(likeCount)}
            onClick={handleLike}
          />

          {/* Comment */}
          <ActionButton
            icon={<MessageCircle className="w-7 h-7 text-white" />}
            label={formatCount(commentCount)}
            onClick={() => setShowComments(true)}
          />

          {/* Save */}
          <ActionButton
            icon={
              <Bookmark
                className={clsx("w-7 h-7", saved ? "fill-yellow-400 text-yellow-400" : "text-white")}
              />
            }
            label="Save"
            onClick={handleSave}
          />

          {/* Share */}
          <ActionButton
            icon={<Share2 className="w-7 h-7 text-white" />}
            label="Share"
            onClick={handleShare}
          />

          {/* Mute */}
          <button
            onClick={onMuteToggle}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-black/40"
          >
            {globalMuted ? (
              <VolumeX className="w-5 h-5 text-white" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </button>

          {/* Owner menu */}
          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setShowMenu((v) => !v)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-black/40"
              >
                <MoreVertical className="w-5 h-5 text-white" />
              </button>
              {showMenu && (
                <div className="absolute right-12 bottom-0 bg-zinc-900 border border-zinc-700 rounded-xl shadow-lg w-36 overflow-hidden">
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 w-full px-4 py-3 text-red-400 hover:bg-zinc-800 text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom info */}
        <div className="absolute bottom-0 left-0 right-16 p-4 pb-6">
          <Link href={`/profile/${video.userId}`} className="flex items-center gap-2 mb-2">
            <span className="text-white font-bold text-sm hover:underline">
              @{video.user.username}
            </span>
          </Link>
          <h2 className="text-white font-semibold text-sm leading-snug line-clamp-2 mb-1">
            {video.title}
          </h2>
          {video.description && (
            <p className="text-zinc-300 text-xs line-clamp-2 mb-1">{video.description}</p>
          )}
          {video.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {video.tags.slice(0, 4).map((tag) => (
                <Link
                  key={tag}
                  href={`/explore?tag=${encodeURIComponent(tag)}`}
                  className="text-cyan-400 text-xs font-medium hover:underline"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}
          <p className="text-zinc-500 text-xs mt-1">{formatCount(video.views)} views</p>
        </div>
      </div>

      {/* Comments drawer */}
      <CommentDrawer
        videoId={video.id}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        onCommentAdded={() => setCommentCount((c) => c + 1)}
      />
    </>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1">
      <div className="drop-shadow-lg">{icon}</div>
      <span className="text-white text-xs font-semibold drop-shadow">{label}</span>
    </button>
  );
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
