"use client";

import { useState } from "react";
import { Avatar, Icon, LikeButton } from "@/components/ui";
import type { Comment } from "@/types";
import { formatRelative } from "@/lib/time";

interface CommentItemProps {
  comment: Comment;
  depth?: number;
  onReply?: (commentId: number, content: string) => void;
  onLike?: (commentId: number) => void;
}

export function CommentItem({
  comment,
  depth = 0,
  onReply,
  onLike,
}: CommentItemProps) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  function submitReply() {
    if (!replyText.trim()) return;
    onReply?.(comment.id, replyText.trim());
    setReplyText("");
    setReplying(false);
  }

  return (
    <div style={{ marginLeft: depth > 0 ? 20 : 0 }}>
      <div className="flex gap-2.5 relative">
        {depth > 0 && (
          <div
            className="absolute"
            style={{
              left: -13,
              top: -6,
              width: 13,
              height: 24,
              borderLeft: "2px solid var(--border)",
              borderBottom: "2px solid var(--border)",
              borderBottomLeftRadius: 10,
            }}
          />
        )}
        <Avatar
          displayName={comment.author.displayName}
          src={comment.author.avatarUrl}
          size={depth > 0 ? 32 : 38}
        />
        <div className="flex-1 min-w-0">
          {/* Bubble */}
          <div
            className="px-3 py-2.5"
            style={{
              background: "var(--surface)",
              borderRadius: 18,
              borderTopLeftRadius: 5,
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              <span
                className="font-display font-bold text-[13.5px]"
                style={{ color: "var(--text)" }}
              >
                {comment.author.displayName}
              </span>
              <span className="text-[12.5px]" style={{ color: "var(--text-faint)" }}>
                · {formatRelative(comment.createdAt)}
              </span>
            </div>
            <p
              className="text-[14.5px] leading-snug"
              style={{ color: "var(--text)", textWrap: "pretty" } as React.CSSProperties}
            >
              {comment.content}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 px-1.5 pt-1.5">
            <LikeButton
              liked={comment.isLiked}
              count={comment.likesCount}
              onToggle={() => onLike?.(comment.id)}
              size={15}
            />
            {depth === 0 && (
              <button
                onClick={() => setReplying((v) => !v)}
                className="text-[12.5px] font-bold"
                style={{ color: "var(--text-muted)" }}
              >
                Répondre
              </button>
            )}
          </div>

          {/* Inline reply input */}
          {replying && (
            <div className="flex gap-2 mt-2">
              <input
                autoFocus
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submitReply()}
                placeholder={`Répondre à @${comment.author.username}…`}
                className="flex-1 h-9 px-4 text-[14px] border-none outline-none rounded-full"
                style={{
                  background: "var(--surface)",
                  border: "1.5px solid var(--border)",
                  color: "var(--text)",
                }}
              />
              <button
                onClick={submitReply}
                disabled={!replyText.trim()}
                className="w-9 h-9 flex items-center justify-center rounded-full disabled:opacity-50"
                style={{ background: "var(--primary)" }}
              >
                <Icon name="send" size={16} color="var(--on-primary)" />
              </button>
            </div>
          )}

          {/* Nested replies */}
          {comment.replies?.map((reply) => (
            <div key={reply.id} className="mt-3">
              <CommentItem
                comment={reply}
                depth={depth + 1}
                onLike={onLike}
                onReply={onReply}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
