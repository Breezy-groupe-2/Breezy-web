'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Avatar, Icon, LikeButton } from '@/components/ui';
import { CommentComposerModal } from '@/features/comments/CommentComposerModal';
import { QuoteComposerModal } from '@/features/posts/QuoteComposerModal';
import { QuotedCard } from '@/features/posts/QuotedCard';
import type { Post } from '@/types';
import { formatRelative } from '@/lib/time';

interface PostCardProps {
  post: Post;
  isOwn?: boolean;
  onLike?: (id: string) => void;
  onRepost?: (id: string) => void;
  onQuoted?: (created: Post) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, newContent: string) => void;
  flat?: boolean;
}

export function PostCard({
  post,
  isOwn = false,
  onLike,
  onRepost,
  onQuoted,
  onDelete,
  onUpdate,
  flat = false,
}: PostCardProps) {
  // A plain repost (no quote text) shows the original post with a "reposted by"
  // label; a quote repost is a normal post that embeds the quoted one.
  const isPlainRepost = !!post.repostOf && !post.content;
  const display = isPlainRepost ? (post.repostOf as Post) : post;
  const reposter = isPlainRepost ? post.author : null;
  const quoted = display.repostOf ?? null;
  const author = display.author;

  const [menuOpen, setMenuOpen] = useState(false);
  const [repostMenuOpen, setRepostMenuOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(display.content);
  const [saving, setSaving] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [commentBump, setCommentBump] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const repostMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen && !repostMenuOpen) return;
    function onOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (repostMenuRef.current && !repostMenuRef.current.contains(e.target as Node)) {
        setRepostMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [menuOpen, repostMenuOpen]);

  async function saveEdit() {
    const trimmed = editText.trim();
    if (!trimmed || trimmed === display.content) {
      setEditing(false);
      setEditText(display.content);
      return;
    }
    setSaving(true);
    try {
      await onUpdate?.(display.id, trimmed);
      setEditing(false);
    } catch {
      // API call failed; stay in edit mode so user can retry
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setEditing(false);
    setEditText(display.content);
  }

  const canEdit = isOwn && !isPlainRepost;

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
      {/* "Reposted by" label for plain reposts */}
      {reposter && (
        <Link
          href={`/profile/${reposter.username}`}
          onClick={(e) => e.stopPropagation()}
          className="flex items-center gap-2 mb-2 ml-1 text-[13px] font-semibold hover:underline"
          style={{ color: 'var(--text-faint)' }}
        >
          <Icon name="repost" size={14} color="var(--text-faint)" />
          {reposter.displayName} a reposté
        </Link>
      )}

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
            <span className="text-[13.5px] whitespace-nowrap" style={{ color: 'var(--text-faint)' }}>
              @{author.username}
            </span>
            <span className="text-[13.5px]" style={{ color: 'var(--text-faint)' }}>
              ·
            </span>
            <span className="text-[13.5px] whitespace-nowrap" style={{ color: 'var(--text-faint)' }}>
              {formatRelative(display.createdAt)}
            </span>

            {/* More menu — only interactive when the displayed post is the viewer's own */}
            <span className="ml-auto relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (canEdit) setMenuOpen((o) => !o);
                }}
                className="flex p-1 -m-1 rounded-full"
                aria-label="Options"
              >
                <Icon name="more" size={18} color="var(--text-faint)" />
              </button>

              {canEdit && menuOpen && (
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
                      onDelete?.(display.id);
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
                  style={{ color: 280 - editText.length < 20 ? 'var(--like)' : 'var(--text-faint)' }}
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
            <Link href={`/post/${display.id}`}>
              {display.content && (
                <p
                  className="text-[15.5px] leading-relaxed whitespace-pre-wrap"
                  style={{ color: 'var(--text)', textWrap: 'pretty' } as React.CSSProperties}
                >
                  {display.content}
                </p>
              )}
              {display.mediaUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={display.mediaUrl}
                  alt="media"
                  className="mt-2 w-full rounded-[14px] object-cover"
                  style={{ maxHeight: 300 }}
                />
              )}
            </Link>
          )}

          {/* Embedded quoted post (quote repost) — kept outside the post link to
              avoid a nested <a> */}
          {!editing && quoted && <QuotedCard post={quoted} />}

          {/* Actions */}
          {!editing && (
            <div className="flex justify-between mt-3 pr-1 max-w-[320px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setComposerOpen(true);
                }}
                className="flex items-center gap-1.5 px-0.5 py-1 rounded-full text-[13.5px] font-semibold transition-colors hover:text-[var(--primary)]"
                style={{ color: 'var(--text-faint)' }}
                aria-label="Commenter"
              >
                <Icon name="comment" size={20} stroke={1.9} />
                {display.commentsCount + commentBump}
              </button>

              {/* Repost button + menu */}
              <span className="relative" ref={repostMenuRef}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setRepostMenuOpen((o) => !o);
                  }}
                  className="flex items-center gap-1.5 px-0.5 py-1 rounded-full text-[13.5px] font-semibold transition-colors"
                  style={{ color: display.isReposted ? 'var(--repost, #00ba7c)' : 'var(--text-faint)' }}
                  aria-label="Reposter"
                >
                  <Icon
                    name="repost"
                    size={20}
                    stroke={1.9}
                    color={display.isReposted ? 'var(--repost, #00ba7c)' : 'currentColor'}
                  />
                  {display.repostCount > 0 && display.repostCount}
                </button>
                {repostMenuOpen && (
                  <div
                    className="absolute left-0 top-7 w-[180px] rounded-[14px] border overflow-hidden z-20"
                    style={{
                      background: 'var(--surface)',
                      borderColor: 'var(--border)',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRepostMenuOpen(false);
                        onRepost?.(display.id);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-[14px] font-semibold"
                      style={{ color: 'var(--text)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Icon name="repost" size={16} color="var(--text)" />
                      {display.isReposted ? 'Annuler le repost' : 'Reposter'}
                    </button>
                    <div className="border-t" style={{ borderColor: 'var(--border)' }} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setRepostMenuOpen(false);
                        setQuoteOpen(true);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-[14px] font-semibold"
                      style={{ color: 'var(--text)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Icon name="edit" size={16} color="var(--text)" />
                      Citer
                    </button>
                  </div>
                )}
              </span>

              <LikeButton
                liked={display.isLiked}
                count={display.likeCount}
                onToggle={() => onLike?.(display.id)}
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

      {composerOpen && (
        <CommentComposerModal
          post={display}
          onClose={() => setComposerOpen(false)}
          onSubmitted={() => setCommentBump((b) => b + 1)}
        />
      )}

      {quoteOpen && (
        <QuoteComposerModal
          post={display}
          onClose={() => setQuoteOpen(false)}
          onQuoted={(created) => onQuoted?.(created)}
        />
      )}
    </article>
  );
}
