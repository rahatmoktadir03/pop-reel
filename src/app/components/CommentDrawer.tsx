"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { X, Send, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "@/utils/time";
import clsx from "clsx";

type Comment = {
  id: string;
  text: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar: string | null;
  };
};

type Props = {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded?: () => void;
};

export default function CommentDrawer({
  videoId,
  isOpen,
  onClose,
  onCommentAdded,
}: Props) {
  const { isSignedIn } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch(`/api/videos/${videoId}/comments`)
      .then((r) => r.json())
      .then((data) => setComments(data.comments || []))
      .finally(() => setLoading(false));
    setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen, videoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/videos/${videoId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      if (res.ok) {
        const comment = await res.json();
        setComments((prev) => [comment, ...prev]);
        setText("");
        onCommentAdded?.();
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Trap scroll inside drawer
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          "fixed inset-0 bg-black/60 z-50 transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={clsx(
          "fixed bottom-0 left-0 right-0 z-50 bg-zinc-950 rounded-t-2xl transition-transform duration-300 flex flex-col",
          "md:left-60", // offset for sidebar on desktop
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
        style={{ height: "70vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <h3 className="text-white font-bold text-base">
            {comments.length > 0 ? `${comments.length} Comments` : "Comments"}
          </h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Comments list */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-zinc-500 py-8 text-sm">
              No comments yet. Be the first!
            </p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-700 flex-shrink-0 overflow-hidden">
                  {comment.user.avatar ? (
                    <img
                      src={comment.user.avatar}
                      alt={comment.user.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                      {comment.user.displayName[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-white text-xs font-semibold">
                      @{comment.user.username}
                    </span>
                    <span className="text-zinc-500 text-[10px]">
                      {formatDistanceToNow(new Date(comment.createdAt))}
                    </span>
                  </div>
                  <p className="text-zinc-200 text-sm mt-0.5">{comment.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input */}
        <div className="border-t border-zinc-800 px-4 py-3 pb-safe">
          {isSignedIn ? (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-zinc-800 text-white placeholder-zinc-500 rounded-full px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-pink-500"
                maxLength={300}
              />
              <button
                type="submit"
                disabled={!text.trim() || submitting}
                className="flex-shrink-0 w-9 h-9 bg-pink-500 disabled:opacity-40 rounded-full flex items-center justify-center transition-opacity"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Send className="w-4 h-4 text-white" />
                )}
              </button>
            </form>
          ) : (
            <p className="text-center text-zinc-500 text-sm">
              <Link href="/sign-in" className="text-pink-400 underline">
                Sign in
              </Link>{" "}
              to comment
            </p>
          )}
        </div>
      </div>
    </>
  );
}
