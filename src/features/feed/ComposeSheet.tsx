"use client";

import { useState, useRef } from "react";
import { Avatar, Icon } from "@/components/ui";
import { useCompose } from "@/store/compose-context";
import { useAuth } from "@/hooks/use-auth";
import { uploadMedia } from "@/features/media/media.api";

const MAX = 280;
const CIRCUMFERENCE = 2 * Math.PI * 11;

export function ComposeSheet() {
  const { isOpen, closeCompose, submit } = useCompose();
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  function clearMedia() {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaPreview(null);
    setMediaUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleClose() {
    setText("");
    clearMedia();
    closeCompose();
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setMediaPreview(preview);
    setMediaUrl(null);
    setUploading(true);
    try {
      const { url } = await uploadMedia(file);
      setMediaUrl(url);
    } catch {
      clearMedia();
    } finally {
      setUploading(false);
    }
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
    if (!text.trim() || over || loading || uploading) return;
    setLoading(true);
    try {
      await submit(text.trim(), mediaUrl ?? undefined);
      setText("");
      clearMedia();
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
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Quoi de neuf dans ta brise ?"
              className="w-full bg-transparent border-none outline-none resize-none text-[18px] leading-relaxed font-sans"
              style={{ color: "var(--text)", minHeight: 140 }}
            />
            {/* Media preview */}
            {mediaPreview && (
              <div className="relative mt-2 rounded-[16px] overflow-hidden">
                <img
                  src={mediaPreview}
                  alt="aperçu"
                  className="w-full object-cover"
                  style={{ maxHeight: 240 }}
                />
                {uploading && (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.35)" }}
                  >
                    <span className="w-8 h-8 rounded-full border-[3px] border-white border-t-transparent animate-spin block" />
                  </div>
                )}
                {!uploading && (
                  <button
                    onClick={clearMedia}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(0,0,0,0.5)" }}
                  >
                    <Icon name="close" size={14} color="white" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Footer */}
        <div
          className="flex items-center gap-1 px-4 py-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 flex items-center justify-center rounded-full"
            style={{ color: "var(--primary)" }}
          >
            <Icon name="image" size={21} />
          </button>
          {(["gust", "bookmark"] as const).map((n) => (
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
              disabled={!text.trim() || over || loading || uploading}
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
