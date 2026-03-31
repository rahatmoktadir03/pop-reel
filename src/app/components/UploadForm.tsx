"use client";

import { useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Film, Tag, CheckCircle2, Loader2 } from "lucide-react";
import clsx from "clsx";
import toast from "react-hot-toast";
import { useUploadThing } from "@/utils/uploadthing";

const MAX_TAGS = 8;
const SUGGESTED_TAGS = [
  "funny", "dance", "music", "food", "travel", "fitness",
  "beauty", "gaming", "tech", "art", "comedy", "lifestyle",
];

type UploadStep = "select" | "details" | "uploading" | "done";

export default function UploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  const [step, setStep] = useState<UploadStep>("select");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  const { startUpload } = useUploadThing("videoUploader", {
    onUploadProgress: (p) => setProgress(Math.round(20 + p * 0.6)),
  });

  const handleFile = useCallback((selectedFile: File) => {
    if (!selectedFile.type.startsWith("video/")) {
      toast.error("Please select a video file.");
      return;
    }
    if (selectedFile.size > 200 * 1024 * 1024) {
      toast.error("File too large. Max 200 MB.");
      return;
    }
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setTitle(selectedFile.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
    setStep("details");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const addTag = (tag: string) => {
    const clean = tag.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
    if (!clean || tags.includes(clean) || tags.length >= MAX_TAGS) return;
    setTags((prev) => [...prev, clean]);
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  /** Capture first frame for content moderation */
  const captureFrame = (): Promise<string | null> => {
    return new Promise((resolve) => {
      const video = videoPreviewRef.current;
      if (!video) return resolve(null);
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      canvas.getContext("2d")?.drawImage(video, 0, 0);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    });
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      toast.error("Please add a title.");
      return;
    }

    setStep("uploading");
    setProgress(5);

    try {
      // 1. Capture moderation frame
      const moderationFrame = await captureFrame();
      setProgress(10);

      // 2. Check content moderation
      if (moderationFrame) {
        const modRes = await fetch("/api/moderate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ frame: moderationFrame }),
        });
        const modData = await modRes.json();
        if (!modData.safe) {
          toast.error(modData.reason || "Inappropriate content detected");
          setStep("details");
          return;
        }
      }
      setProgress(20);

      // 3. Upload via Uploadthing
      const uploaded = await startUpload([file]);
      if (!uploaded || uploaded.length === 0) {
        throw new Error("Upload failed — no response from storage");
      }

      setProgress(85);
      const url = (uploaded[0].serverData as { url: string }).url;

      // 4. Save video metadata
      const metaRes = await fetch("/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          url,
          tags,
          duration: videoPreviewRef.current?.duration || 0,
        }),
      });

      if (!metaRes.ok) {
        const err = await metaRes.json();
        throw new Error(err.error || "Failed to save video");
      }

      setProgress(100);
      setStep("done");
      toast.success("Video uploaded successfully!");
      setTimeout(() => router.push("/feed"), 1500);
    } catch (err: unknown) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Upload failed");
      setStep("details");
    }
  };

  if (step === "done") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <CheckCircle2 className="w-16 h-16 text-green-500" />
        <h2 className="text-white text-xl font-bold">Video Published!</h2>
        <p className="text-zinc-400 text-sm">Redirecting to feed…</p>
      </div>
    );
  }

  if (step === "uploading") {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-20">
        <Loader2 className="w-12 h-12 text-pink-500 animate-spin" />
        <div className="w-64">
          <div className="flex justify-between text-xs text-zinc-400 mb-1">
            <span>Uploading…</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-pink-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (step === "select") {
    return (
      <div
        className={clsx(
          "border-2 border-dashed rounded-2xl p-16 flex flex-col items-center gap-4 transition-colors cursor-pointer",
          dragging
            ? "border-pink-500 bg-pink-500/10"
            : "border-zinc-700 hover:border-zinc-500"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Film className="w-14 h-14 text-zinc-500" />
        <div className="text-center">
          <p className="text-white font-semibold text-lg">
            Drag & drop or click to select
          </p>
          <p className="text-zinc-400 text-sm mt-1">MP4, WebM, MOV — up to 200 MB</p>
        </div>
        <button className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-6 py-2.5 rounded-full transition-colors flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Select Video
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>
    );
  }

  // Details step
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Preview */}
      <div className="relative bg-zinc-900 rounded-2xl overflow-hidden aspect-[9/16] max-h-[70vh] mx-auto w-full max-w-xs">
        {previewUrl && (
          <video
            ref={videoPreviewRef}
            src={previewUrl}
            controls
            className="w-full h-full object-contain"
          />
        )}
        <button
          onClick={() => { setFile(null); setPreviewUrl(null); setStep("select"); }}
          className="absolute top-3 right-3 bg-black/60 rounded-full p-1"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Form */}
      <div className="flex flex-col gap-5">
        {/* Title */}
        <div>
          <label className="text-zinc-300 text-sm font-medium mb-1.5 block">
            Title <span className="text-pink-500">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder="Give your video a catchy title…"
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-500 transition-colors"
          />
          <p className="text-right text-zinc-600 text-xs mt-1">{title.length}/100</p>
        </div>

        {/* Description */}
        <div>
          <label className="text-zinc-300 text-sm font-medium mb-1.5 block">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Tell viewers what this video is about…"
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-pink-500 transition-colors resize-none"
          />
          <p className="text-right text-zinc-600 text-xs mt-1">{description.length}/500</p>
        </div>

        {/* Tags */}
        <div>
          <label className="text-zinc-300 text-sm font-medium mb-1.5 flex items-center gap-2">
            <Tag className="w-4 h-4" /> Tags
            <span className="text-zinc-600 font-normal text-xs">
              ({tags.length}/{MAX_TAGS})
            </span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="bg-zinc-800 text-cyan-400 text-xs px-2.5 py-1 rounded-full flex items-center gap-1"
              >
                #{tag}
                <button onClick={() => removeTag(tag)}>
                  <X className="w-3 h-3 text-zinc-500 hover:text-white" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""))}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  addTag(tagInput);
                }
              }}
              placeholder="Add a tag and press Enter"
              className="flex-1 bg-zinc-800 border border-zinc-700 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-pink-500 transition-colors"
            />
            <button
              onClick={() => addTag(tagInput)}
              className="bg-zinc-800 border border-zinc-700 text-white px-3 py-2.5 rounded-xl text-sm hover:border-zinc-500 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).slice(0, 8).map((tag) => (
              <button
                key={tag}
                onClick={() => addTag(tag)}
                className="text-zinc-500 text-xs px-2 py-0.5 rounded-full border border-zinc-700 hover:border-zinc-500 hover:text-zinc-300 transition-colors"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleUpload}
          disabled={!title.trim()}
          className="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-40 text-white font-bold py-3.5 rounded-xl transition-colors"
        >
          Publish Video
        </button>
      </div>
    </div>
  );
}
