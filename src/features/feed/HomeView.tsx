'use client';

import { useState, useEffect, useCallback } from 'react';
import { BreezyLogo, Icon, Avatar } from '@/components/ui';
import { PostCard } from '@/features/posts/PostCard';
import { FeedSwitch } from '@/features/feed/FeedSwitch';
import { getFeed } from '@/features/feed/feed.api';
import {
  createPost,
  likePost,
  unlikePost,
  deletePost,
  updatePost,
} from '@/features/posts/posts.api';
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
  const [following] = useState(new Set<string>());
  const [composeText, setComposeText] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    getFeed()
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  const handlePost = useCallback(
    async (content: string) => {
      const optimistic: Post = {
        id: crypto.randomUUID(),
        content,
        author: user!,
        likeCount: 0,
        commentsCount: 0,
        isLiked: false,
        createdAt: new Date().toISOString(),
      };
      setPosts((prev) => [optimistic, ...prev]);
      try {
        const created = await createPost(content);
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
      getFeed()
        .then(setPosts)
        .catch(() => {});
    });
  }

  async function handleUpdate(id: string, newContent: string) {
    const updated = await updatePost(id, newContent);
    setPosts((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }

  async function handleDesktopPost() {
    if (!composeText.trim() || posting) return;
    setPosting(true);
    await handlePost(composeText.trim());
    setComposeText('');
    setPosting(false);
  }

  const displayedPosts =
    feedTab === 'all'
      ? posts
      : posts.filter(
          (p) => p.author.username === user?.username || following.has(p.author.username)
        );

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
          <div
            className="flex items-center justify-between pt-3"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <div className="flex gap-1">
              {(['image', 'gust'] as const).map((n) => (
                <button
                  key={n}
                  className="w-9 h-9 flex items-center justify-center rounded-full"
                  style={{ color: 'var(--primary)' }}
                >
                  <Icon name={n} size={20} />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[12px] font-semibold" style={{ color: 'var(--text-faint)' }}>
                {280 - composeText.length}
              </span>
              <button
                onClick={handleDesktopPost}
                disabled={!composeText.trim() || composeText.length > 280 || posting}
                className="h-9 px-5 rounded-full text-[14px] font-bold disabled:opacity-50"
                style={{ background: 'var(--primary)', color: 'var(--on-primary)' }}
              >
                Poster
              </button>
            </div>
          </div>
        </div>
      </div>

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
