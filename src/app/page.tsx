import React, { useState, useEffect } from "react";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import Card from "@tailwindui/react";
import Button from "@tailwindui/react";
import { useRouter } from "next/router";
import axios from "axios";
import WeaviateClient from "weaviate-client";
import Vision from "@google-cloud/vision";

const placeholderVideos = [
  {
    id: 1,
    title: "Sample Video 1",
    url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
  },
  {
    id: 2,
    title: "Sample Video 2",
    url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
  },
  {
    id: 3,
    title: "Sample Video 3",
    url: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
  },
];

const visionClient = new Vision.ImageAnnotatorClient();

const VideoFeed = () => {
  const [videos, setVideos] = useState(placeholderVideos);

  useEffect(() => {
    const fetchRecommendations = async () => {
      // Call to Weaviate for content recommendations
      const weaviateClient = new WeaviateClient({
        scheme: "https",
        host: "localhost:8080",
      });
      const recommendations = await weaviateClient.graphql.get({
        query: `{
          Get {
            VideoRecommendations {
              title
              url
            }
          }
        }`,
      });

      if (recommendations?.data?.Get?.VideoRecommendations) {
        setVideos(recommendations.data.Get.VideoRecommendations);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4">
      {videos.map((video) => (
        <div key={video.id} className="bg-white shadow rounded-md p-4">
          <h2 className="font-bold mb-2">{video.title}</h2>
          <video controls className="w-full rounded-md">
            <source src={video.url} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      ))}
    </div>
  );
};

const UploadVideo = () => {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);

  const handleModeration = async (file) => {
    const [result] = await visionClient.safeSearchDetection(file);
    const detections = result.safeSearchAnnotation;
    if (
      detections.adult === "VERY_LIKELY" ||
      detections.violence === "VERY_LIKELY"
    ) {
      throw new Error("Video contains inappropriate content.");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    try {
      await handleModeration(file);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("file", file);

      await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Video uploaded successfully!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert(error.message || "Failed to upload video.");
    }
  };

  return (
    <form onSubmit={handleUpload} className="bg-white shadow rounded-md p-4">
      <h2 className="font-bold mb-4">Upload Video</h2>
      <div className="mb-4">
        <label htmlFor="title" className="block font-medium mb-2">
          Video Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-md p-2"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="file" className="block font-medium mb-2">
          Video File
        </label>
        <input
          type="file"
          id="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="w-full border rounded-md p-2"
          required
        />
      </div>
      <Button type="submit">Upload</Button>
    </form>
  );
};

const App = () => {
  const router = useRouter();
  const { user } = useUser();

  return (
    <ClerkProvider>
      <div className="min-h-screen bg-gray-100">
        {/* Navbar */}
        <header className="bg-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
            <h1 className="text-xl font-bold">PopReel</h1>
            <div>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <Button onClick={() => router.push("/sign-in")}>Sign In</Button>
              </SignedOut>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="py-10">
          <div className="max-w-4xl mx-auto px-4">
            <SignedIn>
              {user ? (
                <>
                  <Card className="mb-4">
                    <CardContent>
                      <Button onClick={() => router.push("/upload")}>
                        Upload Video
                      </Button>
                    </CardContent>
                  </Card>
                  <VideoFeed />
                </>
              ) : (
                <p className="text-center">Loading...</p>
              )}
            </SignedIn>
            <SignedOut>
              <Card>
                <CardContent>
                  <p className="text-center">
                    Sign in to view and upload videos!
                  </p>
                </CardContent>
              </Card>
            </SignedOut>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t py-4 mt-10">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p>&copy; 2025 PopReel. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </ClerkProvider>
  );
};

export default App;
