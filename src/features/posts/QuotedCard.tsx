'use client';

import Link from 'next/link';
import { Avatar } from '@/components/ui';
import { formatRelative } from '@/lib/time';
import type { Post } from '@/types';

/** Compact, read-only preview of a quoted post embedded inside a quote repost. */
export function QuotedCard({ post }: { post: Post }) {
  return (
    <div
      className="mt-2 rounded-[14px] border p-3"
      style={{ borderColor: 'var(--border)' }}
      onClick={(e) => e.stopPropagation()}
    >
      <Link href={`/post/${post.id}`} className="block">
        <div className="flex items-center gap-1.5">
          <Avatar displayName={post.author.displayName} src={post.author.avatarUrl} size={20} />
          <span className="font-display font-bold text-[13.5px]" style={{ color: 'var(--text)' }}>
            {post.author.displayName}
          </span>
          <span className="text-[12.5px]" style={{ color: 'var(--text-faint)' }}>
            @{post.author.username} · {formatRelative(post.createdAt)}
          </span>
        </div>
        {post.content && (
          <p className="text-[14px] leading-snug mt-1" style={{ color: 'var(--text)' }}>
            {post.content}
          </p>
        )}
        {post.mediaUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.mediaUrl}
            alt="media"
            className="mt-2 w-full rounded-[10px] object-cover"
            style={{ maxHeight: 200 }}
          />
        )}
      </Link>
    </div>
  );
}
