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
  const progressRef = useRef<HTMLDivElement>(null);
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

  // Auto-play/pause driven by parent's isActive prop
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (isActive) {
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
    if (videoRef.current) videoRef.current.muted = globalMuted;
  }, [globalMuted]);

  // Progress bar — update DOM directly to avoid re-renders on every frame
  const handleTimeUpdate = useCallback(() => {
    const el = videoRef.current;
    const bar = progressRef.current;
    if (!el || !bar || !el.duration) return;
    bar.style.width = `${(el.currentTime / el.duration) * 100}%`;
  }, []);

  // Record view after 3s of watching
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
        toast("Sign in to interact", { icon: "🔒" });
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

  // Tapping the card background toggles play/pause
  const handleCardTap = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  };

  const isOwner = user?.id === video.userId;

  return (
    <>
      {/* Full-screen card */}
      <div className="relative w-full h-full bg-black overflow-hidden select-none">

        {/* ── Video ── */}
        <video
          ref={videoRef}
          src={video.url}
          loop
          playsInline
          muted={globalMuted}
          className="absolute inset-0 w-full h-full object-cover"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onError={() => {}}
        />

        {/* ── Gradients ── */}
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* bottom-up gradient for text readability */}
          <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          {/* top-down light gradient */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/50 to-transparent" />
        </div>

        {/* ── Tap-to-play layer (z-20, below buttons) ── */}
        <div
          className="absolute inset-0 z-20"
          onClick={handleCardTap}
        />

        {/* ── Pause indicator ── */}
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="bg-black/40 rounded-full p-5 backdrop-blur-sm border border-white/10">
              <Play className="w-14 h-14 text-white fill-white" />
            </div>
          </div>
        )}

        {/* ── Right action bar (z-30) ── */}
        <div className="absolute right-3 bottom-24 md:bottom-10 z-30 flex flex-col items-center gap-5">

          {/* Avatar + Follow */}
          <div className="flex flex-col items-center gap-1.5">
            <Link href={`/profile/${video.userId}`} className="block" onClick={(e) => e.stopPropagation()}>
              <div className="w-11 h-11 rounded-full bg-zinc-700 overflow-hidden border-2 border-white shadow-lg">
                {video.user.avatar ? (
                  <img
                    src={video.user.avatar}
                    alt={video.user.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-base bg-gradient-to-br from-pink-500 to-rose-600">
                    {(video.user.displayName[0] ?? "?").toUpperCase()}
                  </div>
                )}
              </div>
            </Link>
            {!isOwner && (
              <button
                onClick={(e) => { e.stopPropagation(); handleFollow(); }}
                className={clsx(
                  "text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all",
                  following
                    ? "border-zinc-500 text-zinc-400 bg-zinc-800/50"
                    : "border-pink-500 text-pink-400 bg-pink-500/10"
                )}
              >
                {following ? "Following" : "+ Follow"}
              </button>
            )}
          </div>

          {/* Like */}
          <SideButton
            onClick={(e) => { e.stopPropagation(); handleLike(); }}
            icon={
              <Heart
                className={clsx(
                  "w-7 h-7 transition-all",
                  liked ? "fill-pink-500 text-pink-500 scale-110" : "text-white"
                )}
              />
            }
            label={formatCount(likeCount)}
          />

          {/* Comment */}
          <SideButton
            onClick={(e) => { e.stopPropagation(); setShowComments(true); }}
            icon={<MessageCircle className="w-7 h-7 text-white" />}
            label={formatCount(commentCount)}
          />

          {/* Save */}
          <SideButton
            onClick={(e) => { e.stopPropagation(); handleSave(); }}
            icon={
              <Bookmark
                className={clsx(
                  "w-7 h-7 transition-all",
                  saved ? "fill-yellow-400 text-yellow-400" : "text-white"
                )}
              />
            }
            label="Save"
          />

          {/* Share */}
          <SideButton
            onClick={(e) => { e.stopPropagation(); handleShare(); }}
            icon={<Share2 className="w-7 h-7 text-white" />}
            label="Share"
          />

          {/* Mute */}
          <button
            onClick={(e) => { e.stopPropagation(); onMuteToggle(); }}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/10">
              {globalMuted
                ? <VolumeX className="w-5 h-5 text-white" />
                : <Volume2 className="w-5 h-5 text-white" />
              }
            </div>
          </button>

          {/* Owner menu */}
          {isOwner && (
            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setShowMenu((v) => !v); }}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/10"
              >
                <MoreVertical className="w-5 h-5 text-white" />
              </button>
              {showMenu && (
                <div className="absolute right-12 bottom-0 bg-zinc-900/95 backdrop-blur-md border border-zinc-700/60 rounded-2xl shadow-2xl w-36 overflow-hidden">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); handleDelete(); }}
                    className="flex items-center gap-2 w-full px-4 py-3.5 text-red-400 hover:bg-zinc-800 text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Bottom info (z-30) ── */}
        <div className="absolute bottom-0 left-0 right-16 p-4 pb-20 md:pb-8 z-30">
          <Link
            href={`/profile/${video.userId}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 mb-2 group"
          >
            <span className="text-white font-bold text-sm group-hover:underline drop-shadow-lg">
              @{video.user.username}
            </span>
          </Link>

          <h2 className="text-white font-semibold text-sm leading-snug line-clamp-2 mb-1.5 drop-shadow-lg">
            {video.title}
          </h2>

          {video.description && (
            <p className="text-zinc-300 text-xs line-clamp-2 mb-1.5 drop-shadow">
              {video.description}
            </p>
          )}

          {video.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {video.tags.slice(0, 5).map((tag) => (
                <Link
                  key={tag}
                  href={`/explore?tag=${encodeURIComponent(tag)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-cyan-400 text-xs font-semibold hover:underline drop-shadow"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          <p className="text-zinc-500 text-xs drop-shadow">
            {formatCount(video.views)} views
          </p>
        </div>

        {/* ── Progress bar ── */}
        <div className="absolute bottom-0 inset-x-0 h-0.5 bg-white/15 z-30">
          <div
            ref={progressRef}
            className="h-full bg-white/70"
            style={{ width: "0%" }}
          />
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

function SideButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 group">
      <div className="drop-shadow-lg group-active:scale-90 transition-transform">
        {icon}
      </div>
      <span className="text-white text-xs font-semibold drop-shadow-lg">{label}</span>
    </button>
  );
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
