"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import VideoCard, { Video } from "./VideoCard";
import { Loader2 } from "lucide-react";

type Props = {
  initialVideos?: Video[];
  fetchUrl?: string;
  emptyMessage?: string;
};

export default function VideoFeed({
  initialVideos = [],
  fetchUrl = "/api/recommendations",
  emptyMessage = "No videos yet.",
}: Props) {
  const [videos, setVideos] = useState<Video[]>(initialVideos);
  const [activeIndex, setActiveIndex] = useState(0);
  const [globalMuted, setGlobalMuted] = useState(true);
  const [loading, setLoading] = useState(initialVideos.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);

  // Use a ref for seenIds so loadVideos doesn't recreate on every batch load.
  // If it were state, seenIds changing → loadVideos recreates → observer
  // reconnects → activeIndex resets to 0 every time more videos load.
  const seenIdsRef = useRef<Set<string>>(new Set(initialVideos.map((v) => v.id)));

  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Lock body scroll while this feed is mounted so the page itself doesn't
  // intercept scroll events — the snap container must be the only scroller.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      document.documentElement.style.overflow = "";
    };
  }, []);

  const loadVideos = useCallback(
    async (append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);
      try {
        const seen = seenIdsRef.current;
        const excludeParam =
          append && seen.size > 0
            ? `&exclude=${Array.from(seen).join(",")}`
            : "";
        const res = await fetch(`${fetchUrl}?limit=10${excludeParam}`);
        const data = await res.json();
        const newVideos: Video[] = data.videos || [];
        if (newVideos.length > 0) {
          setVideos((prev) => (append ? [...prev, ...newVideos] : newVideos));
          newVideos.forEach((v) => seen.add(v.id));
        }
      } catch (err) {
        console.error("Failed to load videos:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [fetchUrl] // stable — only changes if fetchUrl changes
  );

  useEffect(() => {
    if (initialVideos.length === 0) loadVideos(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Observer uses the scroll container as its root so it fires correctly
  // on inner scroll (not viewport scroll).
  useEffect(() => {
    observerRef.current?.disconnect();
    const container = containerRef.current;
    if (!container || videos.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        let bestIndex = -1;
        let bestRatio = 0;
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
            const idx = cardRefs.current.indexOf(entry.target as HTMLDivElement);
            if (idx !== -1) {
              bestRatio = entry.intersectionRatio;
              bestIndex = idx;
            }
          }
        }
        if (bestIndex !== -1) {
          setActiveIndex(bestIndex);
          if (bestIndex >= videos.length - 3) loadVideos(true);
        }
      },
      { root: container, threshold: [0.5, 0.9] }
    );

    cardRefs.current.forEach((ref) => {
      if (ref) observerRef.current?.observe(ref);
    });

    return () => observerRef.current?.disconnect();
  }, [videos.length, loadVideos]);

  const handleDelete = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 md:left-60 flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="fixed inset-0 md:left-60 flex flex-col items-center justify-center bg-black text-zinc-400 gap-3">
        <p className="text-lg font-medium">{emptyMessage}</p>
        <p className="text-sm text-zinc-600">Be the first to upload!</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 md:left-60 overflow-y-scroll snap-y snap-mandatory"
    >
      {videos.map((video, i) => (
        <div
          key={video.id}
          ref={(el) => { cardRefs.current[i] = el; }}
          className="relative h-screen w-full snap-start"
        >
          <VideoCard
            video={video}
            isActive={i === activeIndex}
            globalMuted={globalMuted}
            onMuteToggle={() => setGlobalMuted((m) => !m)}
            onDelete={handleDelete}
          />
        </div>
      ))}

      {loadingMore && (
        <div className="h-20 flex items-center justify-center bg-black">
          <Loader2 className="w-6 h-6 text-zinc-600 animate-spin" />
        </div>
      )}
    </div>
  );
}
