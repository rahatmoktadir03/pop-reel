import { NextResponse } from "next/server";
import { Storage } from "@aws-sdk/client-s3";
import { safeSearchDetection } from "@/utils/googleVision"; // Helper function for moderation

const s3 = new Storage({ region: "us-east-1" });

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file)
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    // Moderation: Check for inappropriate content
    const isSafe = await safeSearchDetection(file);
    if (!isSafe)
      return NextResponse.json(
        { error: "Inappropriate content detected" },
        { status: 400 }
      );

    // Upload to AWS S3
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `videos/${file.name}`,
      Body: file.stream(),
    };
    const uploadResult = await s3.upload(uploadParams).promise();

    return NextResponse.json({ url: uploadResult.Location });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
