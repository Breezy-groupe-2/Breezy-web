"use client";

import Link from "next/link";
import { Avatar, Icon, LikeButton } from "@/components/ui";
import type { Post } from "@/types";
import { formatRelative } from "@/lib/time";

interface PostCardProps {
  post: Post;
  onLike?: (id: number) => void;
  onMore?: (post: Post) => void;
  flat?: boolean;
}

export function PostCard({ post, onLike, onMore, flat = false }: PostCardProps) {
  const { author } = post;

  return (
    <article
      className="cursor-pointer"
      style={
        flat
          ? {
              padding: "16px 20px",
              borderBottom: "1px solid var(--border)",
            }
          : {
              background: "var(--surface)",
              borderRadius: "var(--r-card)",
              padding: "16px 17px 12px",
              boxShadow: "var(--card-shadow)",
            }
      }
    >
      <div className="flex gap-3">
        <Link href={`/profile/${author.username}`} onClick={(e) => e.stopPropagation()}>
          <Avatar displayName={author.displayName} src={author.avatarUrl} size={44} />
        </Link>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-1.5 mb-1">
            <Link
              href={`/profile/${author.username}`}
              onClick={(e) => e.stopPropagation()}
              className="font-display font-bold text-[15px] whitespace-nowrap overflow-hidden text-ellipsis hover:underline"
              style={{ color: "var(--text)" }}
            >
              {author.displayName}
            </Link>
            <span className="text-[13.5px] whitespace-nowrap" style={{ color: "var(--text-faint)" }}>
              @{author.username}
            </span>
            <span className="text-[13.5px]" style={{ color: "var(--text-faint)" }}>·</span>
            <span className="text-[13.5px] whitespace-nowrap" style={{ color: "var(--text-faint)" }}>
              {formatRelative(post.createdAt)}
            </span>
            <span className="ml-auto">
              <button
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); onMore?.(post); }}
                className="flex p-1 -m-1 rounded-full"
                aria-label="Options"
              >
                <Icon name="more" size={18} color="var(--text-faint)" />
              </button>
            </span>
          </div>

          {/* Body */}
          <Link href={`/post/${post.id}`}>
            <p
              className="text-[15.5px] leading-relaxed whitespace-pre-wrap"
              style={{ color: "var(--text)", textWrap: "pretty" } as React.CSSProperties}
            >
              {post.content}
            </p>
          </Link>

          {/* Actions */}
          <div className="flex justify-between mt-3 pr-1 max-w-[320px]">
            <Link href={`/post/${post.id}`}>
              <button
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 px-0.5 py-1 rounded-full text-[13.5px] font-semibold"
                style={{ color: "var(--text-faint)" }}
              >
                <Icon name="comment" size={20} stroke={1.9} />
                {post.commentsCount}
              </button>
            </Link>
            <button
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 px-0.5 py-1 rounded-full text-[13.5px] font-semibold"
              style={{ color: "var(--text-faint)" }}
            >
              <Icon name="repost" size={20} stroke={1.9} />
            </button>
            <LikeButton
              liked={post.isLiked}
              count={post.likesCount}
              onToggle={() => onLike?.(post.id)}
            />
            <button
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 px-0.5 py-1 rounded-full"
              style={{ color: "var(--text-faint)" }}
            >
              <Icon name="bookmark" size={20} stroke={1.9} />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
