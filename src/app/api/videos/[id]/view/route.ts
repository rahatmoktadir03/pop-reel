import { NextRequest, NextResponse } from "next/server";
import { safeAuth, getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: videoId } = await params;
  const { userId } = await safeAuth();

  try {
    const { watchTime } = await req.json().catch(() => ({ watchTime: 0 }));

    // Increment view counter
    await prisma.video.update({
      where: { id: videoId },
      data: { views: { increment: 1 } },
    });

    // Record watch history for authenticated users (for recommendations)
    if (userId) {
      const user = await getOrCreateUser();
      if (user) {
        await prisma.view.create({
          data: { userId, videoId, watchTime: watchTime || 0 },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    // Non-critical — don't fail the response
    console.error("[POST /api/videos/[id]/view]", err);
    return NextResponse.json({ success: false });
  }
}
