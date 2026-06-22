"use client";

import { useState, useRef } from "react";
import { Avatar, Icon } from "@/components/ui";
import { useCompose } from "@/store/compose-context";
import { useAuth } from "@/hooks/use-auth";

const MAX = 280;
const CIRCUMFERENCE = 2 * Math.PI * 11;

export function ComposeSheet() {
  const { isOpen, closeCompose, submit } = useCompose();
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!isOpen) return null;

  function handleClose() {
    setText("");
    closeCompose();
  }

  const remaining = MAX - text.length;
  const over = remaining < 0;
  const showRing = remaining <= 20;
  const pct = Math.min(1, text.length / MAX);
  const strokeColor = over
    ? "var(--like)"
    : showRing
    ? "oklch(0.78 0.13 70)"
    : "var(--primary)";

  async function handlePost() {
    if (!text.trim() || over || loading) return;
    setLoading(true);
    try {
      await submit(text.trim());
      setText("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end md:items-center md:justify-center md:p-5">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(20,16,40,0.45)" }}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        className="relative flex flex-col w-full md:max-w-[560px] md:rounded-[24px] overflow-hidden"
        style={{
          background: "var(--bg)",
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          maxHeight: "88svh",
          animation: "b-sheet-in 0.32s cubic-bezier(.3,.8,.3,1) both",
        }}
      >
        {/* Drag handle */}
        <div className="w-10 h-1.5 rounded-full mx-auto mt-2.5 mb-1 md:hidden" style={{ background: "var(--border)" }} />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-2.5">
          <button
            onClick={handleClose}
            className="text-[15.5px] font-bold"
            style={{ color: "var(--text-muted)" }}
          >
            Annuler
          </button>
          <span
            className="font-display font-bold text-[16px]"
            style={{ color: "var(--text)" }}
          >
            Nouveau post
          </span>
          <div className="w-16" />
        </div>

        {/* Compose area */}
        <div className="flex gap-3 px-5 pt-3 pb-1 flex-1 overflow-auto">
          {user && <Avatar displayName={user.displayName} src={user.avatarUrl} size={44} />}
          <textarea
            ref={textareaRef}
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Quoi de neuf dans ta brise ?"
            className="flex-1 bg-transparent border-none outline-none resize-none text-[18px] leading-relaxed font-sans"
            style={{ color: "var(--text)", minHeight: 140 }}
          />
        </div>

        {/* Footer */}
        <div
          className="flex items-center gap-1 px-4 py-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {(["image", "gust", "bookmark"] as const).map((n) => (
            <button
              key={n}
              className="w-10 h-10 flex items-center justify-center rounded-full"
              style={{ color: "var(--primary)" }}
            >
              <Icon name={n} size={21} />
            </button>
          ))}

          <div className="ml-auto flex items-center gap-3.5">
            {/* Ring counter */}
            <div className="relative w-[30px] h-[30px]">
              <svg width="30" height="30" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="15" cy="15" r="11" fill="none" stroke="var(--surface-2)" strokeWidth="3" />
                <circle
                  cx="15"
                  cy="15"
                  r="11"
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={CIRCUMFERENCE * (1 - pct)}
                  style={{ transition: "stroke-dashoffset 0.2s, stroke 0.2s" }}
                />
              </svg>
              {showRing && (
                <span
                  className="absolute inset-0 flex items-center justify-center text-[11px] font-bold"
                  style={{ color: over ? "var(--like)" : "var(--text-muted)" }}
                >
                  {remaining}
                </span>
              )}
            </div>

            <button
              onClick={handlePost}
              disabled={!text.trim() || over || loading}
              className="h-[42px] px-5 rounded-full text-[14.5px] font-bold transition-opacity disabled:opacity-50"
              style={{ background: "var(--primary)", color: "var(--on-primary)" }}
            >
              {loading ? (
                <span className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin block" />
              ) : (
                "Poster"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
