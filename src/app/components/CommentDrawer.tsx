"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { X, Send, Loader2, Heart, MessageCircle } from "lucide-react";
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

function getAvatarGradient(id: string) {
  const g = [
    "from-pink-500 to-rose-500",
    "from-purple-500 to-pink-500",
    "from-cyan-500 to-blue-600",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-amber-400",
    "from-indigo-500 to-purple-600",
    "from-sky-400 to-blue-500",
    "from-fuchsia-500 to-pink-600",
  ];
  return g[id.charCodeAt(id.length - 1) % g.length];
}

export default function CommentDrawer({ videoId, isOpen, onClose, onCommentAdded }: Props) {
  const { isSignedIn } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch(`/api/videos/${videoId}/comments`)
      .then((r) => r.json())
      .then((data) => {
        setComments(data.comments || []);
        // Scroll to top after load
        setTimeout(() => {
          if (listRef.current) listRef.current.scrollTop = 0;
        }, 50);
      })
      .finally(() => setLoading(false));
    setTimeout(() => inputRef.current?.focus(), 350);
  }, [isOpen, videoId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;
    setSubmitting(true);
    const optimistic: Comment = {
      id: `temp-${Date.now()}`,
      text: text.trim(),
      createdAt: new Date().toISOString(),
      user: { id: "me", username: "you", displayName: "You", avatar: null },
    };
    setComments((prev) => [optimistic, ...prev]);
    const draft = text.trim();
    setText("");
    try {
      const res = await fetch(`/api/videos/${videoId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: draft }),
      });
      if (res.ok) {
        const comment = await res.json();
        setComments((prev) => prev.map((c) => (c.id === optimistic.id ? comment : c)));
        onCommentAdded?.();
      } else {
        setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
      }
    } catch {
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLikeComment = (id: string) => {
    setLikedComments((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={clsx(
          "fixed inset-0 bg-black/70 z-50 transition-opacity duration-300 backdrop-blur-sm",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={clsx(
          "fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-3xl transition-transform duration-400",
          "md:left-60",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
        style={{
          height: "72vh",
          background: "linear-gradient(180deg, #141414 0%, #0d0d0d 100%)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-zinc-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800/60 flex-shrink-0">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-pink-500" />
            <h3 className="text-white font-black text-base">
              {comments.length > 0 ? `${comments.length} Comments` : "Comments"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close comments"
            className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-colors"
          >
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        {/* Comments list */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-6 h-6 text-pink-500 animate-spin" />
              <p className="text-zinc-500 text-sm">Loading comments…</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-zinc-600" />
              </div>
              <div className="text-center">
                <p className="text-zinc-300 font-semibold text-sm">No comments yet</p>
                <p className="text-zinc-500 text-xs mt-1">Be the first to say something!</p>
              </div>
            </div>
          ) : (
            comments.map((comment) => {
              const grad = getAvatarGradient(comment.user.id);
              const liked = likedComments.has(comment.id);
              return (
                <div key={comment.id} className="flex gap-3 group slide-up">
                  {/* Avatar */}
                  <Link href={`/profile/${comment.user.id}`} className="flex-shrink-0">
                    <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${grad} p-px shadow-md`}>
                      <div className="w-full h-full rounded-full bg-zinc-900 overflow-hidden flex items-center justify-center">
                        {comment.user.avatar ? (
                          <img src={comment.user.avatar} alt={comment.user.displayName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white text-xs font-bold">
                            {(comment.user.displayName[0] ?? "?").toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <Link href={`/profile/${comment.user.id}`}>
                        <span className="text-white text-xs font-bold hover:text-pink-400 transition-colors">
                          @{comment.user.username}
                        </span>
                      </Link>
                      <span className="text-zinc-600 text-[10px]">
                        {formatDistanceToNow(new Date(comment.createdAt))}
                      </span>
                    </div>
                    <p className="text-zinc-200 text-sm leading-relaxed">{comment.text}</p>
                  </div>

                  {/* Like button */}
                  <button
                    type="button"
                    onClick={() => toggleLikeComment(comment.id)}
                    className="flex-shrink-0 flex flex-col items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Like comment"
                  >
                    <Heart className={clsx(
                      "w-4 h-4 transition-all",
                      liked ? "fill-pink-500 text-pink-500 scale-110" : "text-zinc-500"
                    )} />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Input */}
        <div className="border-t border-zinc-800/60 px-4 py-3 pb-safe flex-shrink-0"
          style={{ background: "rgba(10,10,10,0.95)" }}>
          {isSignedIn ? (
            <form onSubmit={handleSubmit} className="flex gap-2.5 items-center">
              <input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add a comment…"
                maxLength={300}
                className="flex-1 bg-zinc-800/80 text-white placeholder-zinc-500 rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-pink-500/40 border border-zinc-700/50 focus:border-pink-500/50 transition-all"
              />
              <button
                type="submit"
                disabled={!text.trim() || submitting}
                aria-label="Post comment"
                className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 disabled:opacity-30 rounded-2xl flex items-center justify-center transition-all hover:shadow-pink-glow disabled:hover:shadow-none"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                ) : (
                  <Send className="w-4 h-4 text-white" />
                )}
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-2 py-2">
              <p className="text-zinc-400 text-sm">
                <Link href="/sign-in" className="text-pink-400 font-semibold hover:text-pink-300">
                  Sign in
                </Link>{" "}
                to join the conversation
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
