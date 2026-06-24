'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { BreezyLogo, Icon, Avatar } from '@/components/ui';
import { PostCard } from '@/features/posts/PostCard';
import { FeedSwitch } from '@/features/feed/FeedSwitch';
import { getFeed, getAllPosts } from '@/features/feed/feed.api';
import {
  createPost,
  likePost,
  unlikePost,
  deletePost,
  updatePost,
} from '@/features/posts/posts.api';
import { uploadMedia } from '@/features/media/media.api';
import { useCompose } from '@/store/compose-context';
import { useTheme } from '@/store/theme-context';
import { useAuth } from '@/hooks/use-auth';
import type { Post } from '@/types';

type FeedTab = 'mine' | 'all';

export function HomeView() {
  const { user } = useAuth();
  const { toggleTheme, theme } = useTheme();
  const { registerHandler } = useCompose();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedTab, setFeedTab] = useState<FeedTab>('all');
  const [composeText, setComposeText] = useState('');
  const [posting, setPosting] = useState(false);

  const [desktopMediaPreview, setDesktopMediaPreview] = useState<string | null>(null);
  const [desktopMediaUrl, setDesktopMediaUrl] = useState<string | null>(null);
  const [desktopUploading, setDesktopUploading] = useState(false);
  const desktopFileRef = useRef<HTMLInputElement>(null);

  // "Mon feed" = posts from people you follow; "Général" = all posts.
  const loadFeed = useCallback(
    (tab: FeedTab) => (tab === 'mine' ? getFeed() : getAllPosts()),
    []
  );

  useEffect(() => {
    let cancelled = false;
    loadFeed(feedTab)
      .then((p) => !cancelled && setPosts(p))
      .catch(() => !cancelled && setPosts([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [feedTab, loadFeed]);

  const handlePost = useCallback(
    async (content: string, mediaUrl?: string) => {
      const optimistic: Post = {
        id: crypto.randomUUID(),
        content,
        mediaUrl,
        author: user!,
        likeCount: 0,
        commentsCount: 0,
        isLiked: false,
        createdAt: new Date().toISOString(),
      };
      setPosts((prev) => [optimistic, ...prev]);
      try {
        const created = await createPost(content, mediaUrl);
        setPosts((prev) => prev.map((p) => (p.id === optimistic.id ? created : p)));
      } catch (err) {
        setPosts((prev) => prev.filter((p) => p.id !== optimistic.id));
        throw err;
      }
    },
    [user]
  );

  useEffect(() => {
    registerHandler(handlePost);
  }, [registerHandler, handlePost]);

  function handleLike(id: string) {
    let wasLiked = false;
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          wasLiked = p.isLiked;
          return {
            ...p,
            isLiked: !p.isLiked,
            likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1,
          };
        }
        return p;
      })
    );
    const rollback = () =>
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                isLiked: wasLiked,
                likeCount: wasLiked ? p.likeCount + 1 : p.likeCount - 1,
              }
            : p
        )
      );
    (wasLiked ? unlikePost : likePost)(id).catch(rollback);
  }

  function handleDelete(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    deletePost(id).catch(() => {
      loadFeed(feedTab)
        .then(setPosts)
        .catch(() => {});
    });
  }

  async function handleUpdate(id: string, newContent: string) {
    const updated = await updatePost(id, newContent);
    setPosts((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }

  async function handleDesktopFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setDesktopMediaPreview(preview);
    setDesktopMediaUrl(null);
    setDesktopUploading(true);
    try {
      const { url } = await uploadMedia(file);
      setDesktopMediaUrl(url);
    } catch {
      URL.revokeObjectURL(preview);
      setDesktopMediaPreview(null);
    } finally {
      setDesktopUploading(false);
    }
  }

  function clearDesktopMedia() {
    if (desktopMediaPreview) URL.revokeObjectURL(desktopMediaPreview);
    setDesktopMediaPreview(null);
    setDesktopMediaUrl(null);
    if (desktopFileRef.current) desktopFileRef.current.value = '';
  }

  async function handleDesktopPost() {
    if (!composeText.trim() || posting || desktopUploading) return;
    setPosting(true);
    try {
      await handlePost(composeText.trim(), desktopMediaUrl ?? undefined);
      setComposeText('');
      clearDesktopMedia();
    } finally {
      setPosting(false);
    }
  }

  // Posts are already scoped server-side per tab (followed feed vs global).
  const displayedPosts = posts;

  return (
    <div className="flex flex-col min-h-svh scrollbar-hide overflow-y-auto">
      {/* Sticky header */}
      <div
        className="sticky top-0 z-30 pt-[54px] md:pt-0"
        style={{
          background: 'color-mix(in oklch, var(--bg) 82%, transparent)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
        }}
      >
        {/* Mobile only: logo row */}
        <div className="md:hidden flex items-center px-4 pt-2 pb-1">
          <BreezyLogo size={21} />
        </div>

        {/* FeedSwitch + toggle aligned */}
        <div className="flex items-center px-4 pb-2 pt-2 md:pt-2 gap-2">
          <div className="flex-1">
            <FeedSwitch value={feedTab} onChange={setFeedTab} />
          </div>
          <button
            onClick={toggleTheme}
            className="w-[38px] h-[38px] flex items-center justify-center rounded-full shrink-0"
            style={{ background: 'var(--surface)', boxShadow: 'var(--card-shadow)' }}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} color="var(--text)" />
          </button>
        </div>
      </div>

      {/* Desktop inline composer */}
      <div
        className="hidden md:flex gap-3 px-5 py-4 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        {user && <Avatar displayName={user.displayName} src={user.avatarUrl} size={44} />}
        <div className="flex-1">
          <textarea
            value={composeText}
            onChange={(e) => setComposeText(e.target.value)}
            placeholder="Quoi de neuf dans ta brise ?"
            rows={2}
            className="w-full bg-transparent border-none outline-none resize-none text-[18px] leading-relaxed font-sans"
            style={{ color: 'var(--text)' }}
          />

          {/* Desktop media preview */}
          {desktopMediaPreview && (
            <div className="relative mt-2 rounded-[14px] overflow-hidden">
              <img
                src={desktopMediaPreview}
                alt="aperçu"
                className="w-full object-cover"
                style={{ maxHeight: 200 }}
              />
              {desktopUploading && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.35)' }}
                >
                  <span className="w-7 h-7 rounded-full border-[3px] border-white border-t-transparent animate-spin block" />
                </div>
              )}
              {!desktopUploading && (
                <button
                  onClick={clearDesktopMedia}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.5)' }}
                >
                  <Icon name="close" size={12} color="white" />
                </button>
              )}
            </div>
          )}

          <div
            className="flex items-center justify-between pt-3"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <div className="flex gap-1">
              <button
                onClick={() => desktopFileRef.current?.click()}
                className="w-9 h-9 flex items-center justify-center rounded-full"
                style={{ color: 'var(--primary)' }}
              >
                <Icon name="image" size={20} />
              </button>
              <button
                className="w-9 h-9 flex items-center justify-center rounded-full"
                style={{ color: 'var(--primary)' }}
              >
                <Icon name="gust" size={20} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[12px] font-semibold" style={{ color: 'var(--text-faint)' }}>
                {280 - composeText.length}
              </span>
              <button
                onClick={handleDesktopPost}
                disabled={!composeText.trim() || composeText.length > 280 || posting || desktopUploading}
                className="h-9 px-5 rounded-full text-[14px] font-bold disabled:opacity-50"
                style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}
              >
                Poster
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden desktop file input */}
      <input
        ref={desktopFileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleDesktopFileSelect}
      />

      {/* Feed */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="w-8 h-8 rounded-full border-[3px] border-primary border-t-transparent animate-spin block" />
        </div>
      ) : displayedPosts.length === 0 ? (
        <EmptyFeed onDiscover={() => setFeedTab('all')} />
      ) : (
        <div className="flex flex-col gap-3 p-3.5 pb-[120px] md:pb-8">
          {displayedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              isOwn={post.author.username === user?.username}
              onLike={handleLike}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
          <div
            className="flex items-center justify-center gap-2 py-3 text-[13px]"
            style={{ color: 'var(--text-faint)' }}
          >
            <Icon name="gust" size={16} color="var(--text-faint)" />
            tu es à jour
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyFeed({ onDiscover }: { onDiscover: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 px-9 py-16 text-center">
      <div
        className="w-[88px] h-[88px] flex items-center justify-center"
        style={{
          borderRadius: 30,
          background: 'var(--primary-soft)',
          animation: 'b-sway 4s ease-in-out infinite',
        }}
      >
        <Icon name="gust" size={42} color="var(--primary)" stroke={1.8} />
      </div>
      <div>
        <p className="font-display font-extrabold text-[21px]" style={{ color: 'var(--text)' }}>
          Ton feed est tout neuf
        </p>
        <p
          className="text-[15px] leading-relaxed mt-2 max-w-[260px]"
          style={{ color: 'var(--text-muted)' }}
        >
          Suis quelques personnes et leurs posts apparaîtront ici.
        </p>
      </div>
      <button
        onClick={onDiscover}
        className="h-9 px-5 rounded-full text-[14px] font-bold"
        style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}
      >
        Voir le feed général
      </button>
    </div>
  );
}
