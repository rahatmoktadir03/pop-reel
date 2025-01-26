import React, { useState } from "react";

export default function CommentSection() {
  const [comments, setComments] = useState<string[]>([]);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    setComments([...comments, newComment]);
    setNewComment("");
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-bold">Comments</h3>
      <ul className="mt-2 space-y-2">
        {comments.map((comment, index) => (
          <li key={index} className="bg-gray-100 rounded p-2">
            {comment}
          </li>
        ))}
      </ul>
      <input
        type="text"
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Add a comment..."
        className="w-full mt-2 p-2 border rounded"
      />
      <button
        onClick={handleAddComment}
        className="bg-blue-500 text-white rounded mt-2 px-4 py-2"
      >
        Post
      </button>
    </div>
  );
}
