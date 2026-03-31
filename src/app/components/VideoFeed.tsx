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
  const [seenIds, setSeenIds] = useState<Set<string>>(
    new Set(initialVideos.map((v) => v.id))
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const loadVideos = useCallback(
    async (append = false) => {
      if (append) setLoadingMore(true);
      else setLoading(true);

      try {
        const excludeParam =
          append && seenIds.size > 0
            ? `&exclude=${Array.from(seenIds).join(",")}`
            : "";
        const res = await fetch(`${fetchUrl}?limit=10${excludeParam}`);
        const data = await res.json();
        const newVideos: Video[] = data.videos || [];

        if (newVideos.length > 0) {
          setVideos((prev) => (append ? [...prev, ...newVideos] : newVideos));
          setSeenIds((prev) => {
            const next = new Set(prev);
            newVideos.forEach((v) => next.add(v.id));
            return next;
          });
        }
      } catch (err) {
        console.error("Failed to load videos:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [fetchUrl, seenIds]
  );

  useEffect(() => {
    if (initialVideos.length === 0) {
      loadVideos(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Intersection observer to detect active video and trigger pagination
  useEffect(() => {
    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = cardRefs.current.indexOf(
            entry.target as HTMLDivElement
          );
          if (entry.isIntersecting && index !== -1) {
            setActiveIndex(index);

            // Load more when near end
            if (index >= videos.length - 3) {
              loadVideos(true);
            }
          }
        });
      },
      { threshold: 0.7 }
    );

    cardRefs.current.forEach((ref) => {
      if (ref) observerRef.current?.observe(ref);
    });

    return () => observerRef.current?.disconnect();
  }, [videos, loadVideos]);

  const handleDelete = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-zinc-400">
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth"
    >
      {videos.map((video, i) => (
        <div
          key={video.id}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          className="snap-start"
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
        <div className="flex justify-center py-6 bg-black">
          <Loader2 className="w-6 h-6 text-zinc-600 animate-spin" />
        </div>
      )}
    </div>
  );
}
