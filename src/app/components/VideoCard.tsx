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
  UserPlus,
  UserCheck,
  Eye,
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

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function getAvatarGradient(id: string) {
  const g = [
    "from-pink-500 to-rose-500",
    "from-purple-500 to-pink-500",
    "from-cyan-500 to-blue-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-amber-400",
    "from-indigo-500 to-purple-500",
  ];
  return g[id.charCodeAt(id.length - 1) % g.length];
}

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
  const [doubleTapHearts, setDoubleTapHearts] = useState<{ id: number; x: number; y: number }[]>([]);
  const lastTapRef = useRef(0);

  // Sync state if parent re-renders with new video
  useEffect(() => {
    setLiked(video.isLiked);
    setLikeCount(video._count.likes);
    setSaved(video.isSaved);
    setFollowing(video.isFollowing);
    setCommentCount(video._count.comments);
  }, [video.id, video.isLiked, video._count.likes, video.isSaved, video.isFollowing, video._count.comments]);

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
      el.currentTime = 0;
    }
  }, [isActive]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = globalMuted;
  }, [globalMuted]);

  const handleTimeUpdate = useCallback(() => {
    const el = videoRef.current;
    const bar = progressRef.current;
    if (!el || !bar || !el.duration) return;
    bar.style.width = `${(el.currentTime / el.duration) * 100}%`;
  }, []);

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

  const handleLike = useCallback(() =>
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
    }), [liked, video.id, requireAuth]);

  const handleSave = () =>
    requireAuth(async () => {
      const prev = saved;
      setSaved(!saved);
      try {
        const res = await fetch(`/api/videos/${video.id}/save`, { method: "POST" });
        const data = await res.json();
        setSaved(data.saved);
        toast.success(data.saved ? "Saved!" : "Removed from saved", {
          icon: data.saved ? "🔖" : "✓",
          style: { background: "#18181b", color: "#fff", border: "1px solid #3f3f46" },
        });
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
        toast.success(data.following ? `Following @${video.user.username}` : "Unfollowed", {
          style: { background: "#18181b", color: "#fff", border: "1px solid #3f3f46" },
        });
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
      toast.success("Link copied!", {
        style: { background: "#18181b", color: "#fff", border: "1px solid #3f3f46" },
      });
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

  // Double-tap to like
  const handleCardTap = (e: React.MouseEvent) => {
    const el = videoRef.current;
    if (!el) return;

    const now = Date.now();
    const timeSinceLast = now - lastTapRef.current;
    lastTapRef.current = now;

    if (timeSinceLast < 300) {
      // Double tap — spawn heart + like
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = now;
      setDoubleTapHearts((prev) => [...prev, { id, x, y }]);
      setTimeout(() => setDoubleTapHearts((prev) => prev.filter((h) => h.id !== id)), 900);

      if (!liked) handleLike();
      return;
    }

    // Single tap — play/pause
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };

  const isOwner = user?.id === video.userId;
  const avatarGrad = getAvatarGradient(video.userId);

  const actionButtons = (
    <>
      {/* Creator avatar + follow */}
      <div className="flex flex-col items-center gap-1.5">
        <Link href={`/profile/${video.userId}`} onClick={(e) => e.stopPropagation()}>
          <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${avatarGrad} p-px shadow-lg`}>
            <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden flex items-center justify-center">
              {video.user.avatar ? (
                <img src={video.user.avatar} alt={video.user.displayName} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-sm">
                  {(video.user.displayName[0] ?? "?").toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </Link>
        {!isOwner && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleFollow(); }}
            className={clsx(
              "text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all flex items-center gap-0.5",
              following
                ? "border-zinc-600 text-zinc-400 bg-zinc-800/60"
                : "border-pink-500 text-pink-400 bg-pink-500/10 hover:bg-pink-500/20"
            )}
          >
            {following ? <UserCheck className="w-2.5 h-2.5" /> : <UserPlus className="w-2.5 h-2.5" />}
            {following ? "On" : "Follow"}
          </button>
        )}
      </div>

      {/* Like */}
      <SideButton
        onClick={(e) => { e.stopPropagation(); handleLike(); }}
        icon={
          <Heart className={clsx(
            "w-7 h-7 transition-all",
            liked ? "fill-pink-500 text-pink-500 scale-110 drop-shadow-[0_0_8px_rgba(236,72,153,0.8)]" : "text-white"
          )} />
        }
        label={formatCount(likeCount)}
        active={liked}
      />

      {/* Comments */}
      <SideButton
        onClick={(e) => { e.stopPropagation(); setShowComments(true); }}
        icon={<MessageCircle className="w-7 h-7 text-white" />}
        label={formatCount(commentCount)}
      />

      {/* Save */}
      <SideButton
        onClick={(e) => { e.stopPropagation(); handleSave(); }}
        icon={
          <Bookmark className={clsx(
            "w-7 h-7 transition-all",
            saved ? "fill-yellow-400 text-yellow-400" : "text-white"
          )} />
        }
        label={saved ? "Saved" : "Save"}
        active={saved}
      />

      {/* Share */}
      <SideButton
        onClick={(e) => { e.stopPropagation(); handleShare(); }}
        icon={<Share2 className="w-7 h-7 text-white" />}
        label="Share"
      />

      {/* Mute */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onMuteToggle(); }}
        className="flex flex-col items-center gap-1"
        aria-label={globalMuted ? "Unmute" : "Mute"}
      >
        <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/10 hover:bg-black/70 transition-colors">
          {globalMuted
            ? <VolumeX className="w-5 h-5 text-white" />
            : <Volume2 className="w-5 h-5 text-white" />}
        </div>
      </button>

      {/* Owner menu */}
      {isOwner && (
        <div className="relative">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setShowMenu((v) => !v); }}
            className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center border border-white/10 hover:bg-black/70 transition-colors"
            aria-label="More options"
          >
            <MoreVertical className="w-5 h-5 text-white" />
          </button>
          {showMenu && (
            <div className="absolute right-12 bottom-0 bg-zinc-900/98 backdrop-blur-xl border border-zinc-700/60 rounded-2xl shadow-2xl w-40 overflow-hidden scale-in">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowMenu(false); handleDelete(); }}
                className="flex items-center gap-2.5 w-full px-4 py-3.5 text-red-400 hover:bg-zinc-800/80 text-sm font-semibold transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Delete Video
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );

  return (
    <>
      <div className="relative w-full h-full bg-black overflow-hidden select-none flex items-center justify-center">
        {/* Row: video + desktop side-buttons */}
        <div className="flex items-end w-full h-full md:w-auto md:h-[calc(100%-1.5rem)] md:gap-5">

          {/* Video container */}
          <div className="relative flex-1 h-full overflow-hidden md:flex-none md:h-full md:aspect-[9/16] md:rounded-2xl md:shadow-2xl">

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

            {/* Gradient overlays */}
            <div className="absolute inset-0 pointer-events-none z-10">
              <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/50 to-transparent" />
            </div>

            {/* Tap layer — handles single/double tap */}
            <div className="absolute inset-0 z-20" onClick={handleCardTap} />

            {/* Double-tap hearts */}
            {doubleTapHearts.map(({ id, x, y }) => (
              <div
                key={id}
                className="float-heart z-30 pointer-events-none"
                style={{ left: x - 20, top: y - 20 }}
              >
                ❤️
              </div>
            ))}

            {/* Pause indicator */}
            {!playing && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <div className="bg-black/50 rounded-full p-5 backdrop-blur-sm border border-white/15 scale-in">
                  <Play className="w-12 h-12 text-white fill-white" />
                </div>
              </div>
            )}

            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 z-30 p-4 pb-3 pr-20 pb-20 md:pr-4 md:pb-4">
              {/* Creator */}
              <Link
                href={`/profile/${video.userId}`}
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-2 mb-2 group"
              >
                <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${avatarGrad} p-px`}>
                  <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden flex items-center justify-center">
                    {video.user.avatar ? (
                      <img src={video.user.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-[8px] font-bold">
                        {(video.user.displayName[0] ?? "?").toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-white font-bold text-sm group-hover:text-pink-300 transition-colors drop-shadow-lg">
                  @{video.user.username}
                </span>
              </Link>

              {/* Title */}
              <h2 className="text-white font-semibold text-sm leading-snug line-clamp-2 mb-1 drop-shadow-lg">
                {video.title}
              </h2>

              {/* Description */}
              {video.description && (
                <p className="text-zinc-300 text-xs line-clamp-2 mb-1.5 drop-shadow leading-relaxed">
                  {video.description}
                </p>
              )}

              {/* Tags */}
              {video.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {video.tags.slice(0, 4).map((tag) => (
                    <Link
                      key={tag}
                      href={`/explore?tag=${encodeURIComponent(tag)}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-cyan-400 text-xs font-semibold hover:text-cyan-300 transition-colors drop-shadow"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-3 text-zinc-400 text-xs">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {formatCount(video.views)}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-white/10 z-30">
              <div
                ref={progressRef}
                className="h-full bg-gradient-to-r from-pink-500 to-rose-400"
                style={{ width: "0%" }}
              />
            </div>
          </div>

          {/* Desktop side-buttons */}
          <div className="hidden md:flex flex-col items-center gap-5 pb-6 shrink-0">
            {actionButtons}
          </div>
        </div>

        {/* Mobile overlaid buttons */}
        <div className="md:hidden absolute right-3 bottom-24 z-30 flex flex-col items-center gap-5">
          {actionButtons}
        </div>
      </div>

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
  active,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: (e: React.MouseEvent) => void;
  active?: boolean;
}) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-1 group">
      <div className={clsx(
        "drop-shadow-lg group-active:scale-90 transition-all duration-150",
        active ? "scale-105" : ""
      )}>
        {icon}
      </div>
      <span className={clsx(
        "text-xs font-bold drop-shadow-lg transition-colors",
        active ? "text-white" : "text-zinc-200"
      )}>
        {label}
      </span>
    </button>
  );
}
