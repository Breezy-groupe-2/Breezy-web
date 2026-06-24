"use client";

import { useState, useEffect } from "react";
import { EmptyState } from "@/components/ui";
import { PostCard } from "@/features/posts/PostCard";
import { UserRow } from "@/features/users/UserRow";
import { searchUsers } from "@/features/users/users.api";
import { getTrends, searchPosts, likePost, unlikePost } from "@/features/posts/posts.api";
import { applyLikeToggle } from "@/features/posts/post-mutations";
import { useAuth } from "@/hooks/use-auth";
import type { User, Post, Trend } from "@/types";

export function SearchView() {
  const { user: me } = useAuth();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [postResults, setPostResults] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [trends, setTrends] = useState<Trend[]>([]);

  // A "#hashtag" query searches posts; anything else searches profiles.
  const isHashtag = query.trim().startsWith("#");

  // Load trends once for the default "Discover" view (shown when not searching).
  useEffect(() => {
    let cancelled = false;
    getTrends()
      .then((t) => !cancelled && setTrends(t))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Immediate UI reaction (spinner / reset) lives in the change handler so the
  // effect below stays free of synchronous setState.
  function updateQuery(value: string) {
    setQuery(value);
    if (value.trim()) {
      setLoading(true);
    } else {
      setResults([]);
      setPostResults([]);
      setSearched(false);
      setLoading(false);
    }
  }

  // Debounce the query so the API is hit only once the user pauses typing.
  useEffect(() => {
    const term = query.trim();
    if (!term) return;
    const tag = term.startsWith("#");
    let cancelled = false;
    const id = setTimeout(() => {
      const run = tag ? searchPosts(term) : searchUsers(term);
      run
        .then((data) => {
          if (cancelled) return;
          if (tag) {
            setPostResults(data as Post[]);
            setResults([]);
          } else {
            setResults(data as User[]);
            setPostResults([]);
          }
          setSearched(true);
        })
        .catch(() => {
          if (!cancelled) {
            setResults([]);
            setPostResults([]);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [query]);

  function handleLikePost(id: string) {
    const target = postResults.find((p) => p.id === id);
    if (!target) return;
    const wasLiked = target.isLiked;
    setPostResults((prev) => applyLikeToggle(prev, id, !wasLiked));
    (wasLiked ? unlikePost : likePost)(id).catch(() =>
      setPostResults((prev) => applyLikeToggle(prev, id, wasLiked))
    );
  }

  return (
    <div className="flex flex-col min-h-svh scrollbar-hide overflow-y-auto">
      {/* Sticky search bar */}
      <div
        className="sticky top-0 z-30 pt-[54px] md:pt-3 px-4 pb-3"
        style={{
          background: "color-mix(in oklch, var(--bg) 82%, transparent)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
        }}
      >
        <div
          className="flex items-center gap-2.5 h-11 px-4 rounded-full"
          style={{ background: "var(--surface-2)" }}
        >
          <svg
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-faint)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            autoFocus
            value={query}
            onChange={(e) => updateQuery(e.target.value)}
            placeholder="Rechercher un profil ou #hashtag"
            className="flex-1 bg-transparent border-none outline-none text-[15.5px]"
            style={{ color: "var(--text)" }}
          />
          {query && (
            <button onClick={() => updateQuery("")} className="shrink-0" aria-label="Effacer">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-faint)"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="w-7 h-7 rounded-full border-[3px] border-primary border-t-transparent animate-spin block" />
        </div>
      ) : !query.trim() ? (
        trends.length > 0 ? (
          <div className="flex flex-col pb-[120px] md:pb-8">
            <h2
              className="px-5 pt-3 pb-1 font-display font-extrabold text-[20px]"
              style={{ color: "var(--text)" }}
            >
              Tendances
            </h2>
            {trends.map(({ tag, count }, i) => (
              <button
                key={tag}
                onClick={() => updateQuery(tag)}
                className="text-left px-5 py-3 transition-colors hover:bg-[var(--surface-2)]"
              >
                <p className="text-[12.5px]" style={{ color: "var(--text-faint)" }}>
                  {i + 1} · Tendance
                </p>
                <p className="text-[15.5px] font-bold mt-0.5" style={{ color: "var(--text)" }}>
                  {tag}
                </p>
                <p className="text-[12.5px] mt-0.5" style={{ color: "var(--text-faint)" }}>
                  {count} post{count > 1 ? "s" : ""}
                </p>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Découvrir"
            text="Cherche un pseudo ou un nom pour trouver des profils."
          />
        )
      ) : isHashtag ? (
        // Hashtag / keyword search → posts
        searched && postResults.length === 0 ? (
          <EmptyState title="Aucun post" text={`Aucun post pour « ${query.trim()} ».`} />
        ) : (
          <div className="flex flex-col gap-3 p-3.5 pb-[120px] md:pb-8">
            {postResults.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                isOwn={post.author.username === me?.username}
                onLike={handleLikePost}
              />
            ))}
          </div>
        )
      ) : searched && results.length === 0 ? (
        <EmptyState title="Aucun résultat" text={`Personne ne correspond à « ${query.trim()} ».`} />
      ) : (
        <div className="flex flex-col py-1 pb-[120px] md:pb-8">
          {results.map((u) => (
            <UserRow key={u.username} user={u} />
          ))}
        </div>
      )}
    </div>
  );
}
