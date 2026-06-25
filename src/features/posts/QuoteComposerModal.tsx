"use client";

import { useState, useEffect } from "react";
import { Avatar } from "@/components/ui";
import { quotePost } from "@/features/posts/posts.api";
import { useAuth } from "@/hooks/use-auth";
import { formatRelative } from "@/lib/time";
import type { Post } from "@/types";

interface QuoteComposerModalProps {
  /** The post being quoted. */
  post: Post;
  onClose: () => void;
  /** Called with the created quote post. */
  onQuoted?: (created: Post) => void;
}

export function QuoteComposerModal({ post, onClose, onQuoted }: QuoteComposerModalProps) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit() {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const created = await quotePost(text.trim(), post.id);
      onQuoted?.(created);
      onClose();
    } catch {
      setSending(false);
    }
  }

  const remaining = 280 - text.length;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center" onClick={onClose}>
      <div className="absolute inset-0" style={{ background: "rgba(20,16,40,0.5)" }} />
      <div
        className="relative mt-[7vh] w-full max-w-[560px] mx-4 rounded-[22px] overflow-hidden"
        style={{
          background: "var(--bg)",
          boxShadow: "var(--card-shadow)",
          animation: "b-sheet-in 0.26s cubic-bezier(.3,.8,.3,1) both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <button
            onClick={onClose}
            className="text-[15px] font-bold"
            style={{ color: "var(--text-muted)" }}
          >
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={!text.trim() || remaining < 0 || sending}
            className="h-9 px-5 rounded-full text-[14px] font-bold disabled:opacity-50"
            style={{ background: "var(--primary)", color: "var(--on-primary)" }}
          >
            {sending ? "…" : "Reposter"}
          </button>
        </div>

        {/* Composer */}
        <div className="flex gap-3 px-4 pt-4">
          <Avatar displayName={user?.displayName ?? ""} src={user?.avatarUrl} size={40} />
          <div className="flex-1">
            <textarea
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
              }}
              placeholder="Ajoute un commentaire"
              rows={3}
              className="w-full bg-transparent border-none outline-none resize-none text-[17px] leading-relaxed font-sans"
              style={{ color: "var(--text)" }}
            />

            {/* Quoted post preview */}
            <div
              className="mt-1 mb-3 rounded-[14px] border p-3"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex items-center gap-1.5">
                <Avatar
                  displayName={post.author.displayName}
                  src={post.author.avatarUrl}
                  size={20}
                />
                <span className="font-display font-bold text-[13.5px]" style={{ color: "var(--text)" }}>
                  {post.author.displayName}
                </span>
                <span className="text-[12.5px]" style={{ color: "var(--text-faint)" }}>
                  @{post.author.username} · {formatRelative(post.createdAt)}
                </span>
              </div>
              <p className="text-[14px] leading-snug mt-1" style={{ color: "var(--text)" }}>
                {post.content}
              </p>
            </div>

            <div className="flex justify-end">
              <span
                className="text-[12px] font-semibold"
                style={{ color: remaining < 0 ? "var(--like)" : "var(--text-faint)" }}
              >
                {remaining}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
