"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, TrendingUp, Loader2, X, Flame, Sparkles } from "lucide-react";
import VideoGrid from "../components/VideoGrid";
import { Video } from "../components/VideoCard";
import clsx from "clsx";

const TRENDING_TAGS = [
  { tag: "funny",     emoji: "😂" },
  { tag: "dance",     emoji: "💃" },
  { tag: "music",     emoji: "🎵" },
  { tag: "food",      emoji: "🍕" },
  { tag: "travel",    emoji: "✈️" },
  { tag: "fitness",   emoji: "💪" },
  { tag: "beauty",    emoji: "💄" },
  { tag: "gaming",    emoji: "🎮" },
  { tag: "tech",      emoji: "💻" },
  { tag: "art",       emoji: "🎨" },
  { tag: "comedy",    emoji: "🎭" },
  { tag: "cars",      emoji: "🚗" },
  { tag: "nature",    emoji: "🌿" },
  { tag: "animation", emoji: "✨" },
  { tag: "scifi",     emoji: "🤖" },
  { tag: "adventure", emoji: "🏔️" },
];

export default function ExploreClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [activeTag, setActiveTag] = useState(searchParams.get("tag") || "");
  const [videos, setVideos] = useState<Video[]>([]);
  const [trending, setTrending] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(true);

  // Load trending videos for default state
  useEffect(() => {
    setLoadingTrending(true);
    fetch("/api/recommendations?limit=12")
      .then((r) => r.json())
      .then((data) => setTrending(data.videos || []))
      .finally(() => setLoadingTrending(false));
  }, []);

  const search = useCallback(async (q: string, tag: string) => {
    if (!q && !tag) { setVideos([]); return; }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (tag) params.set("tag", tag);
      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      setVideos(data.videos || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const tag = searchParams.get("tag") || "";
    setQuery(q);
    setActiveTag(tag);
    search(q, tag);
  }, [searchParams, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.push(`/explore?${params}`);
  };

  const handleTagClick = (tag: string) => {
    if (activeTag === tag) { setActiveTag(""); router.push("/explore"); }
    else { setActiveTag(tag); setQuery(""); router.push(`/explore?tag=${encodeURIComponent(tag)}`); }
  };

  const clearSearch = () => { setQuery(""); setActiveTag(""); router.push("/explore"); };
  const hasSearch = query || activeTag;

  return (
    <div className="min-h-screen bg-black pb-24 md:pb-8">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-xl border-b border-zinc-800/50 px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-white text-xl font-black">Explore</h1>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="relative mb-3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search videos, creators, tags…"
            className="w-full bg-zinc-900 border border-zinc-700/60 text-white rounded-2xl pl-11 pr-10 py-3 text-sm outline-none focus:border-pink-500/70 focus:ring-1 focus:ring-pink-500/30 transition-all placeholder:text-zinc-500"
          />
          {hasSearch && (
            <button type="button" onClick={clearSearch} aria-label="Clear search" className="absolute right-4 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-zinc-400 hover:text-white transition-colors" />
            </button>
          )}
        </form>

        {/* Tag pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mb-1">
          {TRENDING_TAGS.map(({ tag, emoji }) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagClick(tag)}
              className={clsx(
                "flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                activeTag === tag
                  ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-pink-glow"
                  : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700/50"
              )}
            >
              <span>{emoji}</span>
              <span>#{tag}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
            <p className="text-zinc-500 text-sm">Searching…</p>
          </div>
        ) : hasSearch ? (
          <>
            {/* Search result header */}
            <div className="flex items-center gap-2 mb-4">
              {activeTag ? (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{TRENDING_TAGS.find(t => t.tag === activeTag)?.emoji ?? "🔍"}</span>
                  <div>
                    <h2 className="text-white font-black text-lg">#{activeTag}</h2>
                    <p className="text-zinc-500 text-xs">{videos.length} videos</p>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-white font-bold">Results for &quot;{query}&quot;</h2>
                  <p className="text-zinc-500 text-xs">{videos.length} videos found</p>
                </div>
              )}
            </div>
            <VideoGrid videos={videos} emptyMessage="No videos found — try a different search" />
          </>
        ) : (
          <>
            {/* Trending section */}
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-orange-400" />
              <h2 className="text-white font-black text-lg">Trending Now</h2>
            </div>

            {loadingTrending ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-[9/16] bg-zinc-900 rounded-2xl shimmer" />
                ))}
              </div>
            ) : (
              <VideoGrid videos={trending} emptyMessage="No videos yet — be the first to upload!" />
            )}
          </>
        )}
      </div>
    </div>
  );
}
