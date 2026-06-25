"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui";
import { getSuggestions } from "@/features/users/users.api";
import { getTrends } from "@/features/posts/posts.api";
import { useFollow } from "@/store/follow-context";
import type { User, Trend } from "@/types";

export function RightRail() {
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [trends, setTrends] = useState<Trend[]>([]);
  const { isFollowing, toggle } = useFollow();

  useEffect(() => {
    getSuggestions()
      .then(setSuggestions)
      .catch(() => setSuggestions([]));
    getTrends()
      .then(setTrends)
      .catch(() => setTrends([]));
  }, []);

  return (
    <aside className="hidden lg:flex flex-col gap-4 w-[360px] shrink-0 px-5 py-6 sticky top-0 h-[100dvh] overflow-y-auto self-start">
      {/* Search bar */}
      <Link
        href="/search"
        className="flex items-center gap-3 h-12 px-4 rounded-full shrink-0"
        style={{ background: "var(--surface)", boxShadow: "var(--card-shadow)" }}
      >
        <svg viewBox="0 0 24 24" className="size-[18px] shrink-0" fill="none" stroke="var(--text-faint)" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <span className="text-[15px]" style={{ color: "var(--text-faint)" }}>
          Rechercher sur Breezy
        </span>
      </Link>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div
          className="rounded-[20px] overflow-hidden shrink-0 flex flex-col max-h-[340px]"
          style={{ background: "var(--surface)", boxShadow: "var(--card-shadow)" }}
        >
          <p className="px-5 pt-4 pb-2 font-display font-bold text-[17px] shrink-0" style={{ color: "var(--text)" }}>
            Suggestions pour toi
          </p>
          <div className="overflow-y-auto pb-2">
            {suggestions.map((u) => {
              const isFollowed = isFollowing(u.username);
              return (
                <div key={u.username} className="flex items-center gap-3 px-5 py-2.5">
                  <Link href={`/profile/${u.username}`}>
                    <Avatar displayName={u.displayName} src={u.avatarUrl} size={40} />
                  </Link>
                  <Link href={`/profile/${u.username}`} className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold truncate" style={{ color: "var(--text)" }}>{u.displayName}</p>
                    <p className="text-[13px] truncate" style={{ color: "var(--text-faint)" }}>@{u.username}</p>
                  </Link>
                  <button
                    onClick={() => toggle(u.username)}
                    className="h-8 px-4 rounded-full text-[13px] font-bold transition-colors shrink-0"
                    style={
                      isFollowed
                        ? { background: "var(--surface-2)", color: "var(--text-muted)" }
                        : { background: "var(--primary-soft)", color: "var(--primary)" }
                    }
                  >
                    {isFollowed ? "Suivi" : "Suivre"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tendances */}
      {trends.length > 0 && (
        <div
          className="rounded-[20px] overflow-hidden shrink-0 flex flex-col max-h-[320px]"
          style={{ background: "var(--surface)", boxShadow: "var(--card-shadow)" }}
        >
          <p className="px-5 pt-4 pb-2 font-display font-bold text-[17px] shrink-0" style={{ color: "var(--text)" }}>
            Tendances
          </p>
          <div className="overflow-y-auto pb-2">
            {trends.map(({ tag, count }) => (
              <Link
                key={tag}
                href={`/search?q=${encodeURIComponent(tag)}`}
                className="block px-5 py-3 transition-colors hover:opacity-80"
              >
                <p className="text-[15px] font-bold" style={{ color: "var(--text)" }}>{tag}</p>
                <p className="text-[12.5px]" style={{ color: "var(--text-faint)" }}>
                  {count} post{count > 1 ? "s" : ""}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <p className="px-1 pb-2 text-[12px] shrink-0" style={{ color: "var(--text-faint)" }}>
        Breezy · Conditions · Confidentialité · © 2026
      </p>
    </aside>
  );
}
