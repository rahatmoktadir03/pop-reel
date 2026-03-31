import { NextRequest, NextResponse } from "next/server";
import { safeAuth } from "@/lib/auth";
import { uploadFile } from "@/utils/s3";
import { moderateContent } from "@/utils/googleVision";
import { getOrCreateUser } from "@/lib/auth";

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200 MB
const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];

export async function POST(req: NextRequest) {
  const { userId } = await safeAuth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await getOrCreateUser();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const moderationFrame = formData.get("moderationFrame") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a video file." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 200 MB." },
        { status: 400 }
      );
    }

    // Content moderation on a video frame (if provided)
    if (moderationFrame) {
      const base64Data = moderationFrame.replace(/^data:image\/[a-z]+;base64,/, "");
      const result = await moderateContent(base64Data);
      if (!result.safe) {
        return NextResponse.json(
          { error: result.reason || "Inappropriate content detected" },
          { status: 422 }
        );
      }
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadFile(buffer, file.name, file.type);

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[POST /api/upload]", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

// Increase body size limit for video uploads
export const config = {
  api: { bodyParser: false },
};
