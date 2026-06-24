"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth } from "@/hooks/use-auth";
import { getFollowing, followUser, unfollowUser } from "@/features/users/users.api";

interface FollowContextValue {
  /** Whether the current user follows `username`. */
  isFollowing: (username: string) => boolean;
  /** Optimistically follow/unfollow `username` (reverts on API error). */
  toggle: (username: string) => void;
  /** True once the initial following list has loaded. */
  ready: boolean;
}

const FollowContext = createContext<FollowContextValue | null>(null);

export function FollowProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  // Load the current user's followees once so every consumer shares one source
  // of truth (suggestions list, profile button, …).
  useEffect(() => {
    // No user yet: keep the initial empty set (the provider unmounts on logout).
    if (!user?.username) return;
    let cancelled = false;
    getFollowing(user.username)
      .then((list) => {
        if (cancelled) return;
        setFollowing(new Set(list.map((u) => u.username)));
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.username]);

  const isFollowing = useCallback((username: string) => following.has(username), [following]);

  const toggle = useCallback(
    (username: string) => {
      const willFollow = !following.has(username);
      setFollowing((prev) => {
        const next = new Set(prev);
        if (willFollow) next.add(username);
        else next.delete(username);
        return next;
      });
      (willFollow ? followUser : unfollowUser)(username).catch(() => {
        // revert on failure
        setFollowing((prev) => {
          const next = new Set(prev);
          if (willFollow) next.delete(username);
          else next.add(username);
          return next;
        });
      });
    },
    [following]
  );

  return (
    <FollowContext.Provider value={{ isFollowing, toggle, ready }}>
      {children}
    </FollowContext.Provider>
  );
}

export function useFollow(): FollowContextValue {
  const ctx = useContext(FollowContext);
  if (!ctx) throw new Error("useFollow must be used inside <FollowProvider>");
  return ctx;
}
