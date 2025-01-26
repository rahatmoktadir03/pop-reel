import React, { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    const formData = new FormData();
    if (file) {
      formData.append("file", file);
      const res = await fetch("/api/upload-video", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      alert(data.url ? "Video uploaded successfully!" : data.error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Video</h1>
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />
      <button
        onClick={handleUpload}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Upload
      </button>
    </div>
  );
}
