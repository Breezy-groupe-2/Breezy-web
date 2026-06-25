import type { Post } from "@/types";

/**
 * Find a post by id in a feed list, looking inside embedded reposts too — a
 * plain repost card shows the original (`repostOf`), so actions target that id.
 */
export function findPostInTree(posts: Post[], id: string): Post | undefined {
  for (const post of posts) {
    if (post.id === id) return post;
    if (post.repostOf?.id === id) return post.repostOf;
  }
  return undefined;
}

/**
 * Apply a like toggle to every occurrence of `id` in the list (including the
 * embedded original of a repost card), returning a new list.
 */
export function applyLikeToggle(posts: Post[], id: string, liked: boolean): Post[] {
  const patch = (p: Post): Post => ({
    ...p,
    isLiked: liked,
    likeCount: Math.max(0, p.likeCount + (liked ? 1 : -1)),
  });
  return posts.map((post) => {
    let next = post.id === id ? patch(post) : post;
    if (next.repostOf && next.repostOf.id === id) {
      next = { ...next, repostOf: patch(next.repostOf) };
    }
    return next;
  });
}

/**
 * Apply a repost toggle to every occurrence of `id` in the list, including the
 * embedded original of a repost card, so counts stay in sync everywhere.
 */
export function applyRepostToggle(posts: Post[], id: string, reposted: boolean): Post[] {
  const patch = (p: Post): Post => ({
    ...p,
    isReposted: reposted,
    repostCount: Math.max(0, p.repostCount + (reposted ? 1 : -1)),
  });
  return posts.map((post) => {
    let next = post.id === id ? patch(post) : post;
    if (next.repostOf && next.repostOf.id === id) {
      next = { ...next, repostOf: patch(next.repostOf) };
    }
    return next;
  });
}
