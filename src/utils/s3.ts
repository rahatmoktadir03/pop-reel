import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs";
import path from "path";

const isS3Configured =
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.S3_BUCKET_NAME;

const s3 = isS3Configured
  ? new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  : null;

export async function uploadFile(
  fileBuffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  if (s3 && process.env.S3_BUCKET_NAME) {
    const key = `videos/${Date.now()}_${filename}`;
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: contentType,
      })
    );
    const region = process.env.AWS_REGION || "us-east-1";
    return `https://${process.env.S3_BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;
  }

  // Local fallback for development
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  const safeFilename = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const filePath = path.join(uploadsDir, safeFilename);
  fs.writeFileSync(filePath, fileBuffer);
  return `/uploads/${safeFilename}`;
}

export async function deleteFile(url: string): Promise<void> {
  if (!s3 || !process.env.S3_BUCKET_NAME) {
    // Local file deletion
    if (url.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", url);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    return;
  }

  const bucket = process.env.S3_BUCKET_NAME;
  // Extract key from S3 URL
  const urlObj = new URL(url);
  const key = urlObj.pathname.slice(1); // remove leading /
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

export async function getPresignedUploadUrl(
  filename: string,
  contentType: string
): Promise<{ url: string; key: string } | null> {
  if (!s3 || !process.env.S3_BUCKET_NAME) return null;

  const key = `videos/${Date.now()}_${filename}`;
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });
  const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
  return { url, key };
}
