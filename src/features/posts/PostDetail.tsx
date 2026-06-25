'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Avatar, Icon, LikeButton } from '@/components/ui';
import { CommentItem } from '@/features/comments/CommentItem';
import {
  getPost,
  likePost,
  unlikePost,
  deletePost,
  updatePost,
  repostPost,
  unrepostPost,
} from '@/features/posts/posts.api';
import { QuoteComposerModal } from '@/features/posts/QuoteComposerModal';
import { QuotedCard } from '@/features/posts/QuotedCard';
import {
  getComments,
  addComment,
  addReply,
  deleteComment,
  deleteReply,
  likeComment,
  unlikeComment,
} from '@/features/comments/comments.api';
import { useAuth } from '@/hooks/use-auth';
import { formatRelative } from '@/lib/time';
import type { Post, Comment } from '@/types';

function PostDetailInner() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: me } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);
  const [postMenuOpen, setPostMenuOpen] = useState(false);
  const [repostMenuOpen, setRepostMenuOpen] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(false);
  const [editPostText, setEditPostText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const postMenuRef = useRef<HTMLDivElement>(null);
  const repostMenuRef = useRef<HTMLDivElement>(null);

  const isOwn = post?.author.username === me?.username;

  useEffect(() => {
    if (!postMenuOpen) return;
    function onOutside(e: MouseEvent) {
      if (postMenuRef.current && !postMenuRef.current.contains(e.target as Node)) {
        setPostMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [postMenuOpen]);

  useEffect(() => {
    if (!id) return;
    Promise.all([getPost(id), getComments(id)])
      .then(([p, c]) => {
        setPost(p);
        setComments(c);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Arriving from a post's comment icon (?compose=1): focus the comment box.
  useEffect(() => {
    if (loading || searchParams.get('compose') !== '1') return;
    inputRef.current?.focus();
    inputRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [loading, searchParams]);

  function handleLike() {
    if (!post) return;
    const wasLiked = post.isLiked;
    setPost((p) =>
      p
        ? { ...p, isLiked: !wasLiked, likeCount: wasLiked ? p.likeCount - 1 : p.likeCount + 1 }
        : p
    );
    (wasLiked ? unlikePost : likePost)(post.id);
  }

  function handleRepost() {
    if (!post) return;
    const wasReposted = post.isReposted;
    setPost((p) =>
      p
        ? {
            ...p,
            isReposted: !wasReposted,
            repostCount: wasReposted ? p.repostCount - 1 : p.repostCount + 1,
          }
        : p
    );
    (wasReposted ? unrepostPost : repostPost)(post.id).catch(() =>
      setPost((p) =>
        p
          ? {
              ...p,
              isReposted: wasReposted,
              repostCount: wasReposted ? p.repostCount + 1 : p.repostCount - 1,
            }
          : p
      )
    );
  }

  useEffect(() => {
    if (!repostMenuOpen) return;
    function onOutside(e: MouseEvent) {
      if (repostMenuRef.current && !repostMenuRef.current.contains(e.target as Node)) {
        setRepostMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [repostMenuOpen]);

  async function handleAddComment() {
    if (!post || !commentText.trim() || sending) return;
    setSending(true);
    try {
      const created = await addComment(post.id, commentText.trim());
      setComments((prev) => [...prev, created]);
      setPost((p) => (p ? { ...p, commentsCount: p.commentsCount + 1 } : p));
      setCommentText('');
    } finally {
      setSending(false);
    }
  }

  async function handleDeletePost() {
    if (!post) return;
    try {
      await deletePost(post.id);
      router.back();
    } catch {
      // Delete failed — post stays visible
    }
  }

  async function savePostEdit() {
    if (!post || !editPostText.trim()) return;
    try {
      const updated = await updatePost(post.id, editPostText.trim());
      setPost(updated);
      setEditingPost(false);
    } catch {
      // API call failed; stay in edit mode so user can retry
    }
  }

  async function handleAddReply(commentId: string, content: string) {
    const created = await addReply(commentId, content);
    setComments((prev) =>
      prev.map((cm) =>
        cm.id === commentId
          ? { ...cm, replies: [...(cm.replies ?? []), created as unknown as Comment] }
          : cm
      )
    );
    // A reply also counts as a response to the post.
    setPost((p) => (p ? { ...p, commentsCount: p.commentsCount + 1 } : p));
  }

  async function handleDeleteComment(comment: Comment) {
    const isReply = Boolean(comment.parentId);
    // Deleting a comment also removes its replies; the counter covers both.
    const removed = isReply ? 1 : 1 + (comment.replies?.length ?? 0);
    setComments((prev) => {
      if (isReply) {
        return prev.map((cm) =>
          cm.id === comment.parentId
            ? { ...cm, replies: (cm.replies ?? []).filter((r) => r.id !== comment.id) }
            : cm
        );
      }
      return prev.filter((cm) => cm.id !== comment.id);
    });
    setPost((p) => (p ? { ...p, commentsCount: Math.max(0, p.commentsCount - removed) } : p));
    try {
      if (isReply) {
        await deleteReply(comment.parentId!, comment.id);
      } else if (post) {
        await deleteComment(post.id, comment.id);
      }
    } catch {
      if (id) getComments(id).then(setComments).catch(() => {});
    }
  }

  function handleLikeComment(targetId: string) {
    let wasLiked: boolean | null = null;
    for (const c of comments) {
      if (c.id === targetId) wasLiked = c.isLiked;
      else for (const r of c.replies ?? []) if (r.id === targetId) wasLiked = r.isLiked;
    }
    if (wasLiked === null) return;

    const setLiked = (liked: boolean) =>
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === targetId) {
            return { ...c, isLiked: liked, likeCount: liked ? c.likeCount + 1 : c.likeCount - 1 };
          }
          if (c.replies?.some((r) => r.id === targetId)) {
            return {
              ...c,
              replies: c.replies.map((r) =>
                r.id === targetId
                  ? { ...r, isLiked: liked, likeCount: liked ? r.likeCount + 1 : r.likeCount - 1 }
                  : r
              ),
            };
          }
          return c;
        })
      );

    setLiked(!wasLiked);
    (wasLiked ? unlikeComment : likeComment)(targetId).catch(() => setLiked(wasLiked));
  }

  if (loading || !post) {
    return (
      <div className="flex justify-center py-16">
        <span className="w-8 h-8 rounded-full border-[3px] border-primary border-t-transparent animate-spin block" />
      </div>
    );
  }

  const { author } = post;
  // Total responses (top-level comments + replies) — matches the feed card count.
  const totalComments = post.commentsCount;

  return (
    <div className="flex flex-col min-h-svh">
      {/* Top bar */}
      <div
        className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 pt-[54px] md:pt-3"
        style={{
          background: 'color-mix(in oklch, var(--bg) 82%, transparent)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <button
          onClick={() => router.back()}
          className="w-[42px] h-[42px] flex items-center justify-center rounded-full"
          style={{ background: 'var(--surface)', boxShadow: 'var(--card-shadow)' }}
        >
          <Icon name="back" size={20} color="var(--text)" />
        </button>
        <span className="font-display font-bold text-[19px]" style={{ color: 'var(--text)' }}>
          Post
        </span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-[100px]">
        <div className="px-5 py-3">
          {/* Post header */}
          <div className="flex items-center gap-3">
            <Link
              href={`/profile/${author.username}`}
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              <Avatar displayName={author.displayName} src={author.avatarUrl} size={48} />
              <div>
                <p className="font-display font-bold text-[16px]" style={{ color: 'var(--text)' }}>
                  {author.displayName}
                </p>
                <p className="text-[13.5px]" style={{ color: 'var(--text-faint)' }}>
                  @{author.username}
                </p>
              </div>
            </Link>
            <div className="relative" ref={postMenuRef}>
              <button
                onClick={() => isOwn && setPostMenuOpen((o) => !o)}
                className="w-9 h-9 flex items-center justify-center rounded-full"
              >
                <Icon name="more" size={20} color="var(--text-faint)" />
              </button>
              {isOwn && postMenuOpen && (
                <div
                  className="absolute right-0 top-10 w-[170px] rounded-[14px] border overflow-hidden z-20"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                  }}
                >
                  <button
                    onClick={() => {
                      setEditPostText(post.content);
                      setEditingPost(true);
                      setPostMenuOpen(false);
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
                    onClick={handleDeletePost}
                    className="flex items-center gap-3 w-full px-4 py-3 text-[14px] font-semibold text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Icon name="trash" size={15} color="currentColor" />
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Post body */}
          {editingPost ? (
            <div className="mt-4 mb-3">
              <textarea
                autoFocus
                value={editPostText}
                onChange={(e) => setEditPostText(e.target.value)}
                maxLength={280}
                rows={4}
                className="w-full bg-transparent border-none outline-none resize-none text-[19px] leading-relaxed font-sans"
                style={{ color: 'var(--text)' }}
              />
              <div
                className="flex items-center justify-between pt-2 border-t"
                style={{ borderColor: 'var(--border)' }}
              >
                <span className="text-[12px] font-semibold" style={{ color: 'var(--text-faint)' }}>
                  {280 - editPostText.length}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingPost(false)}
                    className="h-8 px-3 rounded-full text-[13px] font-bold border"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={savePostEdit}
                    disabled={!editPostText.trim() || editPostText.length > 280}
                    className="h-8 px-4 rounded-full text-[13px] font-bold disabled:opacity-50"
                    style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <p
                className="text-[19px] leading-relaxed mt-4 mb-3 whitespace-pre-wrap"
                style={{ color: 'var(--text)', textWrap: 'pretty' } as React.CSSProperties}
              >
                {post.content}
              </p>
              {post.mediaUrl && (
                <img
                  src={post.mediaUrl}
                  alt="media"
                  className="w-full rounded-[16px] object-cover mb-3"
                  style={{ maxHeight: 400 }}
                />
              )}
              {post.repostOf && (
                <div className="mb-3">
                  <QuotedCard post={post.repostOf} />
                </div>
              )}
            </>
          )}

          {/* Timestamp */}
          <p
            className="text-[13.5px] pb-3 border-b"
            style={{ color: 'var(--text-faint)', borderColor: 'var(--border)' }}
          >
            {formatRelative(post.createdAt)} · Aujourd&apos;hui
          </p>

          {/* Stats */}
          <div
            className="flex gap-5 py-3 text-[14px] border-b"
            style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}
          >
            <span>
              <b className="font-display font-bold" style={{ color: 'var(--text)' }}>
                {post.likeCount}
              </b>{' '}
              j&apos;aime
            </span>
            <span>
              <b className="font-display font-bold" style={{ color: 'var(--text)' }}>
                {totalComments}
              </b>{' '}
              commentaires
            </span>
          </div>

          {/* Action bar */}
          <div
            className="flex justify-around py-2 border-b"
            style={{ borderColor: 'var(--border)' }}
          >
            <button style={{ color: 'var(--text-faint)' }}>
              <Icon name="comment" size={22} />
            </button>
            <span className="relative" ref={repostMenuRef}>
              <button
                onClick={() => setRepostMenuOpen((o) => !o)}
                className="flex items-center gap-1.5 text-[14px] font-semibold"
                style={{ color: post.isReposted ? 'var(--repost, #00ba7c)' : 'var(--text-faint)' }}
                aria-label="Reposter"
              >
                <Icon
                  name="repost"
                  size={22}
                  color={post.isReposted ? 'var(--repost, #00ba7c)' : 'currentColor'}
                />
                {post.repostCount > 0 && post.repostCount}
              </button>
              {repostMenuOpen && (
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-9 w-[180px] rounded-[14px] border overflow-hidden z-20"
                  style={{
                    background: 'var(--surface)',
                    borderColor: 'var(--border)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                  }}
                >
                  <button
                    onClick={() => {
                      setRepostMenuOpen(false);
                      handleRepost();
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-[14px] font-semibold"
                    style={{ color: 'var(--text)' }}
                  >
                    <Icon name="repost" size={16} color="var(--text)" />
                    {post.isReposted ? 'Annuler le repost' : 'Reposter'}
                  </button>
                  <div className="border-t" style={{ borderColor: 'var(--border)' }} />
                  <button
                    onClick={() => {
                      setRepostMenuOpen(false);
                      setQuoteOpen(true);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-[14px] font-semibold"
                    style={{ color: 'var(--text)' }}
                  >
                    <Icon name="edit" size={16} color="var(--text)" />
                    Citer
                  </button>
                </div>
              )}
            </span>
            <LikeButton
              liked={post.isLiked}
              count={post.likeCount}
              onToggle={handleLike}
              size={22}
            />
            <button style={{ color: 'var(--text-faint)' }}>
              <Icon name="share" size={22} />
            </button>
          </div>

          {/* Comments */}
          <div className="flex flex-col gap-4 pt-5">
            {comments.length === 0 && (
              <p className="text-center text-[14px] py-5" style={{ color: 'var(--text-faint)' }}>
                Sois le premier à répondre 🌱
              </p>
            )}
            {comments.map((c) => (
              <CommentItem
                key={c.id}
                comment={c}
                meUsername={me?.username}
                onLike={handleLikeComment}
                onReply={handleAddReply}
                onDelete={handleDeleteComment}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Comment input */}
      <div
        className="sticky bottom-0 flex items-center gap-2.5 px-4 py-3"
        style={{
          background: 'color-mix(in oklch, var(--bg) 85%, transparent)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid var(--border)',
          paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
        }}
      >
        {me && <Avatar displayName={me.displayName} size={34} />}
        <input
          ref={inputRef}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
          placeholder="Ajouter un commentaire…"
          className="flex-1 h-[42px] px-4 text-[14.5px] border-none outline-none rounded-full"
          style={{
            background: 'var(--surface)',
            border: '1.5px solid var(--border)',
            color: 'var(--text)',
          }}
        />
        <button
          onClick={handleAddComment}
          disabled={!commentText.trim() || sending}
          className="w-[42px] h-[42px] flex items-center justify-center rounded-full disabled:opacity-50"
          style={{ background: 'var(--primary)' }}
        >
          {sending ? (
            <span className="w-4 h-4 rounded-full border-2 border-on-primary border-t-transparent animate-spin block" />
          ) : (
            <Icon name="send" size={18} color="var(--on-primary)" />
          )}
        </button>
      </div>

      {quoteOpen && post && (
        <QuoteComposerModal
          post={post}
          onClose={() => setQuoteOpen(false)}
          onQuoted={(created) => router.push(`/post/${created.id}`)}
        />
      )}
    </div>
  );
}

export function PostDetail() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-16">
          <span className="w-8 h-8 rounded-full border-[3px] border-primary border-t-transparent animate-spin block" />
        </div>
      }
    >
      <PostDetailInner />
    </Suspense>
  );
}
