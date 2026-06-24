"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui";
import { useFollow } from "@/store/follow-context";
import { useAuth } from "@/hooks/use-auth";
import type { User } from "@/types";

interface UserRowProps {
  user: User;
  /** Show the user's bio under the handle (used in follower/following lists). */
  showBio?: boolean;
  avatarSize?: number;
}

/**
 * Shared user list row: avatar + display name + @handle (+ optional bio) and a
 * follow toggle wired to FollowContext. The follow button is hidden on the
 * viewer's own row. Replaces the duplicated rows in SearchView, FollowListView
 * and RightRail.
 */
export function UserRow({ user, showBio = false, avatarSize = 44 }: UserRowProps) {
  const { user: me } = useAuth();
  const { isFollowing, toggle } = useFollow();

  const isMe = user.username === me?.username;
  const isFollowed = isFollowing(user.username);

  return (
    <div className="flex items-start gap-3 px-5 py-3">
      <Link href={`/profile/${user.username}`}>
        <Avatar displayName={user.displayName} src={user.avatarUrl} size={avatarSize} />
      </Link>
      <Link href={`/profile/${user.username}`} className="flex-1 min-w-0">
        <p className="text-[15px] font-bold truncate" style={{ color: "var(--text)" }}>
          {user.displayName}
        </p>
        <p className="text-[13.5px] truncate" style={{ color: "var(--text-faint)" }}>
          @{user.username}
        </p>
        {showBio && user.bio && (
          <p
            className="text-[14px] leading-snug mt-1 line-clamp-2"
            style={{ color: "var(--text-muted)" }}
          >
            {user.bio}
          </p>
        )}
      </Link>
      {!isMe && (
        <button
          onClick={() => toggle(user.username)}
          className="h-8 px-4 rounded-full text-[13px] font-bold transition-colors shrink-0"
          style={
            isFollowed
              ? { background: "var(--surface-2)", color: "var(--text-muted)" }
              : { background: "var(--primary)", color: "var(--on-primary)" }
          }
        >
          {isFollowed ? "Suivi" : "Suivre"}
        </button>
      )}
    </div>
  );
}
