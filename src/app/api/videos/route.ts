import { NextResponse } from "next/server";

const mockVideos = [
  {
    id: 1,
    title: "Sample Video 1",
    url: "/videos/sample1.mp4",
    likes: 10,
    comments: 5,
  },
  {
    id: 2,
    title: "Sample Video 2",
    url: "/videos/sample2.mp4",
    likes: 20,
    comments: 8,
  },
];

export async function GET() {
  return NextResponse.json(mockVideos);
}
