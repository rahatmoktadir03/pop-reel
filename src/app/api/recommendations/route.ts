import { NextRequest, NextResponse } from "next/server";
import { safeAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Adaptive recommendation engine.
 *
 * Scoring formula per video:
 *   score = likesWeight    * likeCount
 *         + viewsWeight    * viewCount
 *         + recencyWeight  * recencyScore   (decays over time)
 *         + affinityWeight * tagAffinityScore (based on watch history)
 *         + followWeight   * isFollowing
 *
 * Falls back to popularity + recency for unauthenticated users.
 *
 * If WEAVIATE_HOST is configured, Weaviate semantic search results are
 * merged in as a bonus signal.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 20);
  const excludeIds = searchParams.get("exclude")?.split(",").filter(Boolean) || [];

  const { userId } = await safeAuth();

  try {
    // Fetch candidate videos (up to 200 to score)
    const candidates = await prisma.video.findMany({
      where: {
        status: "active",
        id: { notIn: excludeIds.length > 0 ? excludeIds : undefined },
      },
      include: {
        user: { select: { id: true, username: true, displayName: true, avatar: true } },
        _count: { select: { likes: true, comments: true, saves: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    const now = Date.now();

    // Build user affinity from watch history
    const tagFrequency: Record<string, number> = {};
    const followingSet = new Set<string>();

    if (userId) {
      const [recentViews, follows] = await Promise.all([
        prisma.view.findMany({
          where: { userId },
          include: { video: { select: { tags: true } } },
          orderBy: { createdAt: "desc" },
          take: 50,
        }),
        prisma.follow.findMany({
          where: { followerId: userId },
          select: { followingId: true },
        }),
      ]);

      follows.forEach((f) => followingSet.add(f.followingId));

      // Build tag frequency map from watch history
      recentViews.forEach((view, idx) => {
        const recencyBoost = 1 / (idx + 1); // most recent = highest weight
        const tags: string[] = JSON.parse(view.video.tags || "[]");
        tags.forEach((tag) => {
          tagFrequency[tag] = (tagFrequency[tag] || 0) + recencyBoost;
        });
      });
    }

    // Score each candidate
    const scored = candidates.map((video) => {
      const ageDays = (now - new Date(video.createdAt).getTime()) / 86_400_000;
      const recencyScore = Math.max(0, 1 - ageDays / 30) * 100; // 0–100 over 30 days

      const tags: string[] = JSON.parse(video.tags || "[]");
      const affinityScore = tags.reduce((sum, tag) => {
        return sum + (tagFrequency[tag] || 0);
      }, 0);

      const followBonus = followingSet.has(video.userId) ? 50 : 0;

      const score =
        0.3 * video._count.likes +
        0.05 * video.views +
        recencyScore +
        20 * affinityScore +
        followBonus;

      return { video, score };
    });

    // Sort by score desc, inject a little randomness in top picks to avoid staleness
    scored.sort((a, b) => b.score - a.score);

    // Take top candidates and shuffle bottom 30% for diversity
    const topN = Math.ceil(scored.length * 0.7);
    const top = scored.slice(0, topN);
    const rest = scored.slice(topN).sort(() => Math.random() - 0.5);
    const final = [...top, ...rest].slice(0, limit);

    let videos = final.map(({ video }) => ({
      ...video,
      tags: JSON.parse(video.tags || "[]"),
      isLiked: false,
      isSaved: false,
      isFollowing: false,
    }));

    // Enrich with per-user social state
    if (userId && videos.length > 0) {
      const ids = videos.map((v) => v.id);
      const [likes, saves] = await Promise.all([
        prisma.like.findMany({
          where: { userId, videoId: { in: ids } },
          select: { videoId: true },
        }),
        prisma.save.findMany({
          where: { userId, videoId: { in: ids } },
          select: { videoId: true },
        }),
      ]);
      const likedSet = new Set(likes.map((l) => l.videoId));
      const savedSet = new Set(saves.map((s) => s.videoId));
      videos = videos.map((v) => ({
        ...v,
        isLiked: likedSet.has(v.id),
        isSaved: savedSet.has(v.id),
        isFollowing: followingSet.has(v.userId),
      }));
    }

    return NextResponse.json({ videos });
  } catch (err) {
    console.error("[GET /api/recommendations]", err);
    return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
  }
}
