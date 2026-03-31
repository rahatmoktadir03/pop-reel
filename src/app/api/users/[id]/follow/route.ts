import { NextRequest, NextResponse } from "next/server";
import { safeAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: followingId } = await params;
  const { userId: followerId } = await safeAuth();

  if (!followerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (followerId === followingId) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  try {
    await getOrCreateUser();

    const existing = await prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId } },
    });

    if (existing) {
      await prisma.follow.delete({ where: { id: existing.id } });
    } else {
      // Ensure target user exists
      const target = await prisma.user.findUnique({ where: { id: followingId } });
      if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
      await prisma.follow.create({ data: { followerId, followingId } });
    }

    const followerCount = await prisma.follow.count({ where: { followingId } });
    return NextResponse.json({ following: !existing, followerCount });
  } catch (err) {
    console.error("[POST /api/users/[id]/follow]", err);
    return NextResponse.json({ error: "Failed to toggle follow" }, { status: 500 });
  }
}
