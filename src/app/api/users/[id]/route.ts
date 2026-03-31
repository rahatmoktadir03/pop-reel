import { NextRequest, NextResponse } from "next/server";
import { safeAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId: currentUserId } = await safeAuth();

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: { videos: true, followers: true, following: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let isFollowing = false;
    if (currentUserId && currentUserId !== id) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: { followerId: currentUserId, followingId: id },
        },
      });
      isFollowing = !!follow;
    }

    return NextResponse.json({ ...user, isFollowing });
  } catch (err) {
    console.error("[GET /api/users/[id]]", err);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { userId } = await safeAuth();

  if (!userId || userId !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { bio, displayName } = await req.json();
    const user = await prisma.user.update({
      where: { id },
      data: {
        bio: bio !== undefined ? bio : undefined,
        displayName: displayName || undefined,
      },
    });
    return NextResponse.json(user);
  } catch (err) {
    console.error("[PATCH /api/users/[id]]", err);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
