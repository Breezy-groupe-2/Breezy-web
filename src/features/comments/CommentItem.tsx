"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, Icon, LikeButton } from "@/components/ui";
import type { Comment } from "@/types";
import { formatRelative } from "@/lib/time";

interface CommentItemProps {
  comment: Comment;
  depth?: number;
  meUsername?: string;
  onReply?: (commentId: string, content: string) => void;
  onLike?: (commentId: string) => void;
  onDelete?: (comment: Comment) => void;
}

export function CommentItem({
  comment,
  depth = 0,
  meUsername,
  onReply,
  onLike,
  onDelete,
}: CommentItemProps) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isMine = Boolean(meUsername) && comment.author.username === meUsername;

  useEffect(() => {
    if (!menuOpen) return;
    function onOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [menuOpen]);

  // Replies are flat under their top-level comment. Replying to a reply targets
  // that same parent comment (with an @mention), instead of nesting deeper.
  const isReply = depth > 0;
  const targetCommentId = isReply ? comment.parentId ?? comment.id : comment.id;

  function openReply() {
    setReplying((v) => {
      const next = !v;
      if (next && isReply) setReplyText(`@${comment.author.username} `);
      return next;
    });
  }

  function submitReply() {
    if (!replyText.trim()) return;
    onReply?.(targetCommentId, replyText.trim());
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
            className="relative px-3 py-2.5"
            style={{
              background: "var(--surface)",
              borderRadius: 18,
              borderTopLeftRadius: 5,
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div className="flex items-center gap-1.5 mb-0.5 pr-5">
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

            {/* Kebab menu (own comments only) */}
            {isMine && onDelete && (
              <div ref={menuRef} className="absolute top-1.5 right-2">
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="w-7 h-7 flex items-center justify-center rounded-full transition-colors hover:bg-[var(--surface-2)]"
                  aria-label="Options du commentaire"
                >
                  <Icon name="more" size={16} color="var(--text-faint)" />
                </button>
                {menuOpen && (
                  <div
                    className="absolute right-0 top-8 z-20 rounded-[14px] overflow-hidden py-1 min-w-[150px]"
                    style={{ background: "var(--surface)", boxShadow: "var(--card-shadow), inset 0 0 0 1px var(--border)" }}
                  >
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(comment);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13.5px] font-semibold transition-colors hover:bg-[var(--surface-2)]"
                      style={{ color: "var(--like)" }}
                    >
                      <Icon name="trash" size={15} color="currentColor" />
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            )}
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
              count={comment.likeCount}
              onToggle={() => onLike?.(comment.id)}
              size={15}
            />
            {onReply && (
              <button
                onClick={openReply}
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
                meUsername={meUsername}
                onLike={onLike}
                onReply={onReply}
                onDelete={onDelete}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
