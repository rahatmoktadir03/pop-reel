import { createUploadthing, type FileRouter } from "uploadthing/next";
import { safeAuth, getOrCreateUser } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  videoUploader: f({ video: { maxFileSize: "128MB", maxFileCount: 1 } })
    .middleware(async () => {
      const { userId } = await safeAuth();
      if (!userId) throw new Error("Unauthorized");
      await getOrCreateUser();
      return { userId };
    })
    .onUploadComplete(async ({ file }) => {
      // Return the URL so the client can save metadata via /api/videos
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
