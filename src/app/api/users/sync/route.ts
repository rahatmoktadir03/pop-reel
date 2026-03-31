import { NextRequest, NextResponse } from "next/server";
import { safeAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { userId } = await safeAuth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { username, displayName, avatar, bio } = await req.json();

    const user = await prisma.user.upsert({
      where: { id: userId },
      create: {
        id: userId,
        username: username || `user_${userId.slice(-8)}`,
        displayName: displayName || username || "PopReel User",
        avatar: avatar || null,
        bio: bio || "",
      },
      update: {
        avatar: avatar || undefined,
        displayName: displayName || undefined,
      },
    });

    return NextResponse.json(user);
  } catch (err) {
    console.error("[POST /api/users/sync]", err);
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}
