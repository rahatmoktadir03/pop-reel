"use client";

import { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import { Film, Bookmark, UserCheck, UserPlus, Grid3x3, Heart, Eye } from "lucide-react";
import VideoGrid from "../../components/VideoGrid";
import { Video as VideoType } from "../../components/VideoCard";
import toast from "react-hot-toast";

type UserData = {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  bio: string;
  createdAt: Date;
  _count: { videos: number; followers: number; following: number };
  isFollowing: boolean;
};

type Props = {
  user: UserData;
  isOwner: boolean;
};

type Tab = "videos" | "saved";

// Stable gradient per user based on id
function getUserGradient(id: string) {
  const gradients = [
    "from-pink-600 via-rose-500 to-orange-400",
    "from-purple-600 via-pink-500 to-rose-400",
    "from-cyan-500 via-blue-500 to-purple-600",
    "from-emerald-500 via-teal-500 to-cyan-500",
    "from-orange-500 via-amber-400 to-yellow-300",
    "from-indigo-600 via-purple-500 to-pink-500",
    "from-rose-500 via-pink-400 to-fuchsia-500",
    "from-sky-500 via-cyan-400 to-teal-400",
  ];
  const idx = id.charCodeAt(id.length - 1) % gradients.length;
  return gradients[idx];
}

export default function ProfileClient({ user, isOwner }: Props) {
  const [tab, setTab] = useState<Tab>("videos");
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(user.isFollowing);
  const [followerCount, setFollowerCount] = useState(user._count.followers);

  useEffect(() => {
    setLoading(true);
    const endpoint =
      tab === "saved"
        ? `/api/users/${user.id}/videos?tab=saved`
        : `/api/users/${user.id}/videos`;
    fetch(endpoint)
      .then((r) => r.json())
      .then((data) => setVideos(data.videos || []))
      .finally(() => setLoading(false));
  }, [tab, user.id]);

  const handleFollow = async () => {
    const prev = following;
    setFollowing(!following);
    setFollowerCount((c) => c + (following ? -1 : 1));
    try {
      const res = await fetch(`/api/users/${user.id}/follow`, { method: "POST" });
      const data = await res.json();
      setFollowing(data.following);
      setFollowerCount(data.followerCount);
    } catch {
      setFollowing(prev);
      setFollowerCount((c) => c + (prev ? 1 : -1));
      toast.error("Failed to update follow");
    }
  };

  const gradient = getUserGradient(user.id);
  const totalLikes = videos.reduce((s, v) => s + v._count.likes, 0);
  const totalViews = videos.reduce((s, v) => s + v.views, 0);

  const initials = (user.displayName[0] ?? user.username[0] ?? "?").toUpperCase();

  return (
    <div className="min-h-screen bg-black pb-24 md:pb-8">
      {/* Cover gradient */}
      <div className={`h-36 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        {/* Decorative circles */}
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/5 rounded-full" />
      </div>

      {/* Profile header */}
      <div className="px-4 pb-5 -mt-14 relative">
        <div className="flex items-end justify-between mb-3">
          {/* Avatar */}
          <div className="relative">
            <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${gradient} p-0.5 shadow-xl`}>
              <div className="w-full h-full rounded-2xl bg-zinc-900 overflow-hidden flex items-center justify-center">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className={`text-3xl font-black bg-gradient-to-br ${gradient} bg-clip-text text-transparent`}>
                    {initials}
                  </span>
                )}
              </div>
            </div>
            {isOwner && (
              <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-zinc-900 rounded-full flex items-center justify-center border-2 border-zinc-800">
                <UserButton afterSignOutUrl="/" />
              </div>
            )}
          </div>

          {/* Follow / owner action */}
          {!isOwner && (
            <button
              type="button"
              onClick={handleFollow}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all ${
                following
                  ? "bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700"
                  : "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-pink-glow hover:from-pink-600 hover:to-rose-700"
              }`}
            >
              {following ? (
                <><UserCheck className="w-4 h-4" /> Following</>
              ) : (
                <><UserPlus className="w-4 h-4" /> Follow</>
              )}
            </button>
          )}
        </div>

        {/* Name & bio */}
        <div className="mb-4">
          <h1 className="text-white text-xl font-black leading-tight">{user.displayName}</h1>
          <p className="text-zinc-400 text-sm mb-2">@{user.username}</p>
          {user.bio && <p className="text-zinc-300 text-sm leading-relaxed">{user.bio}</p>}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-5 gap-2">
          <StatCard label="Videos"    value={user._count.videos}  />
          <StatCard label="Followers" value={followerCount}        />
          <StatCard label="Following" value={user._count.following} />
          <StatCard label="Likes"     value={totalLikes}   icon={<Heart className="w-3 h-3 text-pink-400" />} />
          <StatCard label="Views"     value={totalViews}   icon={<Eye className="w-3 h-3 text-cyan-400" />} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800/80 px-1">
        <TabButton
          active={tab === "videos"}
          onClick={() => setTab("videos")}
          icon={<Grid3x3 className="w-4 h-4" />}
          label="Videos"
        />
        {isOwner && (
          <TabButton
            active={tab === "saved"}
            onClick={() => setTab("saved")}
            icon={<Bookmark className="w-4 h-4" />}
            label="Saved"
          />
        )}
        <TabButton
          active={false}
          onClick={() => {}}
          icon={<Film className="w-4 h-4" />}
          label={`${user._count.videos} total`}
          disabled
        />
      </div>

      {/* Content */}
      <div className="px-3 pt-4">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[9/16] bg-zinc-900 rounded-2xl shimmer" />
            ))}
          </div>
        ) : (
          <VideoGrid
            videos={videos}
            emptyMessage={
              tab === "saved"
                ? "No saved videos yet"
                : isOwner
                ? "Upload your first video!"
                : "No videos yet"
            }
          />
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon?: React.ReactNode }) {
  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K`
    : String(n);

  return (
    <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl px-2 py-2 text-center">
      <div className="flex items-center justify-center gap-1 mb-0.5">
        {icon}
        <p className="text-white font-black text-sm leading-tight">{fmt(value)}</p>
      </div>
      <p className="text-zinc-500 text-[10px] font-medium">{label}</p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold border-b-2 transition-colors ${
        disabled
          ? "border-transparent text-zinc-600 cursor-default"
          : active
          ? "border-pink-500 text-white"
          : "border-transparent text-zinc-500 hover:text-zinc-300"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
