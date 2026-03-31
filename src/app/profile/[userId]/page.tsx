import { notFound } from "next/navigation";
import { safeAuth, getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId: currentUserId } = await safeAuth();
  const { userId } = await params;

  // If the visitor is viewing their own profile, sync them to the DB first
  if (currentUserId === userId) {
    await getOrCreateUser();
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: { select: { videos: true, followers: true, following: true } },
    },
  });

  if (!user) notFound();

  let isFollowing = false;
  if (currentUserId && currentUserId !== userId) {
    const follow = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId: currentUserId, followingId: userId } },
    });
    isFollowing = !!follow;
  }

  const isOwner = currentUserId === userId;

  return (
    <ProfileClient
      user={{ ...user, isFollowing }}
      isOwner={isOwner}
    />
  );
}
