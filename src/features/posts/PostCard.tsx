'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Avatar, Icon, LikeButton } from '@/components/ui';
import type { Post } from '@/types';
import { formatRelative } from '@/lib/time';

interface PostCardProps {
  post: Post;
  isOwn?: boolean;
  onLike?: (id: string) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, newContent: string) => void;
  flat?: boolean;
}

export function PostCard({
  post,
  isOwn = false,
  onLike,
  onDelete,
  onUpdate,
  flat = false,
}: PostCardProps) {
  const { author } = post;
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(post.content);
  const [saving, setSaving] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [menuOpen]);

  async function saveEdit() {
    const trimmed = editText.trim();
    if (!trimmed || trimmed === post.content) {
      setEditing(false);
      setEditText(post.content);
      return;
    }
    setSaving(true);
    try {
      await onUpdate?.(post.id, trimmed);
      setEditing(false);
    } catch {
      // API call failed; stay in edit mode so user can retry
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setEditing(false);
    setEditText(post.content);
  }

  return (
    <article
      className="cursor-pointer"
      style={
        flat
          ? { padding: '16px 20px', borderBottom: '1px solid var(--border)' }
          : {
              background: 'var(--surface)',
              borderRadius: 'var(--r-card)',
              padding: '16px 17px 12px',
              boxShadow: 'var(--card-shadow)',
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
              style={{ color: 'var(--text)' }}
            >
              {author.displayName}
            </Link>
            <span
              className="text-[13.5px] whitespace-nowrap"
              style={{ color: 'var(--text-faint)' }}
            >
              @{author.username}
            </span>
            <span className="text-[13.5px]" style={{ color: 'var(--text-faint)' }}>
              ·
            </span>
            <span
              className="text-[13.5px] whitespace-nowrap"
              style={{ color: 'var(--text-faint)' }}
            >
              {formatRelative(post.createdAt)}
            </span>

            {/* More menu — only interactive when isOwn */}
            <span className="ml-auto relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (isOwn) setMenuOpen((o) => !o);
                }}
                className="flex p-1 -m-1 rounded-full"
                aria-label="Options"
              >
                <Icon name="more" size={18} color="var(--text-faint)" />
              </button>

              {isOwn && menuOpen && (
                <div
                  className="absolute right-0 top-6 w-[170px] rounded-[14px] border overflow-hidden z-20"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditing(true);
                      setMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-[14px] font-semibold transition-colors"
                    style={{ color: 'var(--text)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Icon name="edit" size={15} color="var(--text)" />
                    Modifier
                  </button>
                  <div className="border-t" style={{ borderColor: 'var(--border)' }} />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      onDelete?.(post.id);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-[14px] font-semibold text-red-500 transition-colors hover:bg-red-50"
                  >
                    <Icon name="trash" size={15} color="currentColor" />
                    Supprimer
                  </button>
                </div>
              )}
            </span>
          </div>

          {/* Body */}
          {editing ? (
            <div onClick={(e) => e.stopPropagation()}>
              <textarea
                autoFocus
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                maxLength={280}
                rows={3}
                className="w-full bg-transparent border-none outline-none resize-none text-[15.5px] leading-relaxed font-sans"
                style={{ color: 'var(--text)' }}
              />
              <div
                className="flex items-center justify-between pt-2 mt-1 border-t"
                style={{ borderColor: 'var(--border)' }}
              >
                <span
                  className="text-[12px] font-semibold"
                  style={{
                    color: 280 - editText.length < 20 ? 'var(--like)' : 'var(--text-faint)',
                  }}
                >
                  {280 - editText.length}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={cancelEdit}
                    className="h-8 px-3 rounded-full text-[13px] font-bold border"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={saveEdit}
                    disabled={!editText.trim() || editText.length > 280 || saving}
                    className="h-8 px-4 rounded-full text-[13px] font-bold disabled:opacity-50"
                    style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}
                  >
                    {saving ? '…' : 'OK'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link href={`/post/${post.id}`}>
              <p
                className="text-[15.5px] leading-relaxed whitespace-pre-wrap"
                style={{ color: 'var(--text)', textWrap: 'pretty' } as React.CSSProperties}
              >
                {post.content}
              </p>
            </Link>
          )}

          {/* Actions */}
          {!editing && (
            <div className="flex justify-between mt-3 pr-1 max-w-[320px]">
              <Link href={`/post/${post.id}`}>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 px-0.5 py-1 rounded-full text-[13.5px] font-semibold"
                  style={{ color: 'var(--text-faint)' }}
                >
                  <Icon name="comment" size={20} stroke={1.9} />
                  {post.commentsCount}
                </button>
              </Link>
              <button
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 px-0.5 py-1 rounded-full text-[13.5px] font-semibold"
                style={{ color: 'var(--text-faint)' }}
              >
                <Icon name="repost" size={20} stroke={1.9} />
              </button>
              <LikeButton
                liked={post.isLiked}
                count={post.likeCount}
                onToggle={() => onLike?.(post.id)}
              />
              <button
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 px-0.5 py-1 rounded-full"
                style={{ color: 'var(--text-faint)' }}
              >
                <Icon name="bookmark" size={20} stroke={1.9} />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
