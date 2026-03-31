"use client";

import { useState, useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import { Film, Bookmark } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-black pb-24 md:pb-8">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 border-b border-zinc-800">
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white">
                {user.displayName[0]?.toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-white text-xl font-black truncate">
              {user.displayName}
            </h1>
            <p className="text-zinc-400 text-sm">@{user.username}</p>

            {/* Stats */}
            <div className="flex gap-4 mt-2">
              <Stat label="Videos" value={user._count.videos} />
              <Stat label="Followers" value={followerCount} />
              <Stat label="Following" value={user._count.following} />
            </div>
          </div>

          {/* Action */}
          <div className="flex-shrink-0">
            {isOwner ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <button
                type="button"
                onClick={handleFollow}
                className={`px-5 py-2 rounded-full font-semibold text-sm transition-colors ${
                  following
                    ? "bg-zinc-800 text-white border border-zinc-600"
                    : "bg-pink-500 text-white"
                }`}
              >
                {following ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>

        {user.bio && (
          <p className="text-zinc-300 text-sm leading-relaxed">{user.bio}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800">
        <TabButton
          active={tab === "videos"}
          onClick={() => setTab("videos")}
          icon={<Film className="w-4 h-4" />}
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
      </div>

      {/* Content */}
      <div className="px-3 pt-3">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[9/16] bg-zinc-900 rounded-xl shimmer"
              />
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

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <p className="text-white font-bold text-base leading-tight">
        {value >= 1000 ? `${(value / 1000).toFixed(1)}K` : value}
      </p>
      <p className="text-zinc-500 text-xs">{label}</p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
        active
          ? "border-white text-white"
          : "border-transparent text-zinc-500 hover:text-zinc-300"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
