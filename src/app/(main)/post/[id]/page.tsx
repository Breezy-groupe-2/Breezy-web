"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, Icon, LikeButton } from "@/components/ui";
import { CommentItem } from "@/features/comments/CommentItem";
import { getPost, likePost, unlikePost } from "@/features/posts/posts.api";
import { getComments, addComment } from "@/features/comments/comments.api";
import { useAuth } from "@/hooks/use-auth";
import { formatRelative } from "@/lib/time";
import type { Post, Comment } from "@/types";

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user: me } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    Promise.all([getPost(Number(id)), getComments(Number(id))])
      .then(([p, c]) => {
        setPost(p);
        setComments(c);
      })
      .finally(() => setLoading(false));
  }, [id]);

  function handleLike() {
    if (!post) return;
    const wasLiked = post.isLiked;
    setPost((p) =>
      p
        ? { ...p, isLiked: !wasLiked, likesCount: wasLiked ? p.likesCount - 1 : p.likesCount + 1 }
        : p
    );
    (wasLiked ? unlikePost : likePost)(post.id);
  }

  async function handleAddComment() {
    if (!post || !commentText.trim() || sending) return;
    setSending(true);
    try {
      const created = await addComment(post.id, commentText.trim());
      setComments((prev) => [...prev, created]);
      setPost((p) => (p ? { ...p, commentsCount: p.commentsCount + 1 } : p));
      setCommentText("");
    } finally {
      setSending(false);
    }
  }

  function handleLikeComment(commentId: number) {
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, isLiked: !c.isLiked, likesCount: c.isLiked ? c.likesCount - 1 : c.likesCount + 1 }
          : c
      )
    );
  }

  if (loading || !post) {
    return (
      <div className="flex justify-center py-16">
        <span className="w-8 h-8 rounded-full border-[3px] border-primary border-t-transparent animate-spin block" />
      </div>
    );
  }

  const { author } = post;
  const totalComments = comments.length;

  return (
    <div className="flex flex-col min-h-svh">
      {/* Top bar */}
      <div
        className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 pt-[54px] md:pt-3"
        style={{
          background: "color-mix(in oklch, var(--bg) 82%, transparent)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        <button
          onClick={() => router.back()}
          className="w-[42px] h-[42px] flex items-center justify-center rounded-full"
          style={{ background: "var(--surface)", boxShadow: "var(--card-shadow)" }}
        >
          <Icon name="back" size={20} color="var(--text)" />
        </button>
        <span
          className="font-display font-bold text-[19px]"
          style={{ color: "var(--text)" }}
        >
          Post
        </span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-[100px]">
        <div className="px-5 py-3">
          {/* Post header */}
          <Link href={`/profile/${author.username}`} className="flex items-center gap-3 cursor-pointer">
            <Avatar displayName={author.displayName} src={author.avatarUrl} size={48} />
            <div>
              <p className="font-display font-bold text-[16px]" style={{ color: "var(--text)" }}>
                {author.displayName}
              </p>
              <p className="text-[13.5px]" style={{ color: "var(--text-faint)" }}>
                @{author.username}
              </p>
            </div>
            <div className="ml-auto">
              <Icon name="more" size={20} color="var(--text-faint)" />
            </div>
          </Link>

          {/* Post body */}
          <p
            className="text-[19px] leading-relaxed mt-4 mb-3 whitespace-pre-wrap"
            style={{ color: "var(--text)", textWrap: "pretty" } as React.CSSProperties}
          >
            {post.content}
          </p>

          {/* Timestamp */}
          <p
            className="text-[13.5px] pb-3 border-b"
            style={{ color: "var(--text-faint)", borderColor: "var(--border)" }}
          >
            {formatRelative(post.createdAt)} · Aujourd&apos;hui
          </p>

          {/* Stats */}
          <div
            className="flex gap-5 py-3 text-[14px] border-b"
            style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}
          >
            <span>
              <b className="font-display font-bold" style={{ color: "var(--text)" }}>
                {post.likesCount}
              </b>{" "}
              j&apos;aime
            </span>
            <span>
              <b className="font-display font-bold" style={{ color: "var(--text)" }}>
                {totalComments}
              </b>{" "}
              commentaires
            </span>
          </div>

          {/* Action bar */}
          <div
            className="flex justify-around py-2 border-b"
            style={{ borderColor: "var(--border)" }}
          >
            <button style={{ color: "var(--text-faint)" }}>
              <Icon name="comment" size={22} />
            </button>
            <button style={{ color: "var(--text-faint)" }}>
              <Icon name="repost" size={22} />
            </button>
            <LikeButton
              liked={post.isLiked}
              count={post.likesCount}
              onToggle={handleLike}
              size={22}
            />
            <button style={{ color: "var(--text-faint)" }}>
              <Icon name="share" size={22} />
            </button>
          </div>

          {/* Comments */}
          <div className="flex flex-col gap-4 pt-5">
            {comments.length === 0 && (
              <p className="text-center text-[14px] py-5" style={{ color: "var(--text-faint)" }}>
                Sois le premier à répondre 🌱
              </p>
            )}
            {comments.map((c) => (
              <CommentItem
                key={c.id}
                comment={c}
                onLike={handleLikeComment}
                onReply={(commentId, content) => {
                  setComments((prev) =>
                    prev.map((cm) =>
                      cm.id === commentId
                        ? {
                            ...cm,
                            replies: [
                              ...(cm.replies ?? []),
                              {
                                id: Date.now(),
                                content,
                                author: me!,
                                postId: post.id,
                                parentId: commentId,
                                likesCount: 0,
                                isLiked: false,
                                createdAt: new Date().toISOString(),
                              },
                            ],
                          }
                        : cm
                    )
                  );
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Comment input */}
      <div
        className="sticky bottom-0 flex items-center gap-2.5 px-4 py-3"
        style={{
          background: "color-mix(in oklch, var(--bg) 85%, transparent)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid var(--border)",
          paddingBottom: "calc(12px + env(safe-area-inset-bottom))",
        }}
      >
        {me && <Avatar displayName={me.displayName} size={34} />}
        <input
          ref={inputRef}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
          placeholder="Ajouter un commentaire…"
          className="flex-1 h-[42px] px-4 text-[14.5px] border-none outline-none rounded-full"
          style={{
            background: "var(--surface)",
            border: "1.5px solid var(--border)",
            color: "var(--text)",
          }}
        />
        <button
          onClick={handleAddComment}
          disabled={!commentText.trim() || sending}
          className="w-[42px] h-[42px] flex items-center justify-center rounded-full disabled:opacity-50"
          style={{ background: "var(--primary)" }}
        >
          {sending ? (
            <span className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin block" />
          ) : (
            <Icon name="send" size={18} color="var(--on-primary)" />
          )}
        </button>
      </div>
    </div>
  );
}
