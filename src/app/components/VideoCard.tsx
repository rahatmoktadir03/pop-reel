import React from "react";

export default function VideoCard({
  title,
  url,
  likes,
  comments,
}: {
  title: string;
  url: string;
  likes: number;
  comments: number;
}) {
  return (
    <div className="rounded-lg shadow-lg p-4 bg-white">
      <video controls className="rounded-lg w-full">
        <source src={url} type="video/mp4" />
      </video>
      <h2 className="mt-2 text-lg font-bold">{title}</h2>
      <div className="flex justify-between mt-1 text-gray-600">
        <p>{likes} Likes</p>
        <p>{comments} Comments</p>
      </div>
    </div>
  );
}
