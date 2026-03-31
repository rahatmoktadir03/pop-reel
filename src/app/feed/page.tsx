import VideoFeed from "../components/VideoFeed";

export default function FeedPage() {
  return <VideoFeed fetchUrl="/api/recommendations" />;
}
