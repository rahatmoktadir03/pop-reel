"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, TrendingUp, Loader2, X } from "lucide-react";
import VideoGrid from "../components/VideoGrid";
import { Video } from "../components/VideoCard";
import clsx from "clsx";

const TRENDING_TAGS = [
  "funny", "dance", "music", "food", "travel", "fitness",
  "beauty", "gaming", "tech", "art", "comedy", "lifestyle",
  "nature", "sports", "education", "diy",
];

export default function ExploreClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [activeTag, setActiveTag] = useState(searchParams.get("tag") || "");
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen bg-black px-4 pt-4 pb-24 md:pb-8">
      <div className="mb-6">
        <h1 className="text-white text-2xl font-black mb-4">Explore</h1>

        <form onSubmit={handleSearch} className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search videos, creators, tags…"
            className="w-full bg-zinc-900 border border-zinc-800 text-white rounded-full pl-10 pr-10 py-3 text-sm outline-none focus:border-pink-500 transition-colors"
          />
          {hasSearch && (
            <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-zinc-500 hover:text-white" />
            </button>
          )}
        </form>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-pink-500" />
            <span className="text-zinc-400 text-sm font-medium">Trending</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {TRENDING_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={clsx(
                  "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                  activeTag === tag
                    ? "bg-pink-500 text-white"
                    : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                )}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
        </div>
      ) : hasSearch ? (
        <>
          <p className="text-zinc-500 text-sm mb-4">
            {videos.length > 0
              ? `${videos.length} results for ${activeTag ? `#${activeTag}` : `"${query}"`}`
              : `No results for ${activeTag ? `#${activeTag}` : `"${query}"`}`}
          </p>
          <VideoGrid videos={videos} emptyMessage={`No videos found`} />
        </>
      ) : (
        <div className="text-center py-16 text-zinc-500">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Search for videos or tap a trending tag</p>
        </div>
      )}
    </div>
  );
}
