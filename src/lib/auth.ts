import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

/**
 * Safe wrapper around Clerk's auth() — returns { userId: null } instead of
 * throwing when NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is not yet configured.
 */
export async function safeAuth(): Promise<{ userId: string | null }> {
  try {
    return await auth();
  } catch {
    return { userId: null };
  }
}

/** Returns the current Clerk user ID, or null if not authenticated or Clerk not configured. */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await safeAuth();
  return userId;
}

/** Syncs the Clerk user into the DB on first authenticated action. Returns null if not authenticated. */
export async function getOrCreateUser() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const existing = await prisma.user.findUnique({ where: { id: userId } });
    if (existing) return existing;

    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const username =
      clerkUser.username ||
      clerkUser.emailAddresses[0]?.emailAddress?.split("@")[0] ||
      `user_${userId.slice(-8)}`;

    const displayName = clerkUser.fullName || clerkUser.firstName || username;

    return prisma.user.create({
      data: {
        id: userId,
        username,
        displayName,
        avatar: clerkUser.imageUrl || null,
      },
    });
  } catch {
    return null;
  }
}

export type VideoWithMeta = {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail: string | null;
  tags: string[];
  views: number;
  duration: number;
  status: string;
  createdAt: Date;
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
  isLiked?: boolean;
  isSaved?: boolean;
  isFollowing?: boolean;
};
