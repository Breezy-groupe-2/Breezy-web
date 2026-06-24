import apiClient from "@/lib/axios";
import type { Post, Trend } from "@/types";

export async function getPost(id: string): Promise<Post> {
  const { data } = await apiClient.get<Post>(`/api/v1/posts/${id}`);
  return data;
}

export async function getTrends(): Promise<Trend[]> {
  const { data } = await apiClient.get<Trend[]>("/api/v1/posts/trends");
  return data;
}

export async function createPost(
  content: string,
  mediaUrl?: string,
  repostOf?: string
): Promise<Post> {
  const { data } = await apiClient.post<Post>("/api/v1/posts", { content, mediaUrl, repostOf });
  return data;
}

/** Quote repost: a new post that embeds `postId` with the author's comment. */
export async function quotePost(content: string, postId: string): Promise<Post> {
  return createPost(content, undefined, postId);
}

export async function repostPost(id: string): Promise<Post> {
  const { data } = await apiClient.post<Post>(`/api/v1/posts/${id}/repost`);
  return data;
}

export async function unrepostPost(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/posts/${id}/repost`);
}

export async function updatePost(
  id: string,
  content: string,
  mediaUrl?: string | null
): Promise<Post> {
  // `mediaUrl` omitted = leave unchanged; null = remove; string = replace.
  const body: { content: string; mediaUrl?: string | null } = { content };
  if (mediaUrl !== undefined) body.mediaUrl = mediaUrl;
  const { data } = await apiClient.put<Post>(`/api/v1/posts/${id}`, body);
  return data;
}

export async function deletePost(id: string): Promise<void> {
  await apiClient.delete(`/api/v1/posts/${id}`);
}

export async function likePost(id: string): Promise<{ id: string; likeCount: number }> {
  const { data } = await apiClient.post<{ id: string; likeCount: number }>(`/api/v1/posts/${id}/like`);
  return data;
}

export async function unlikePost(id: string): Promise<{ id: string; likeCount: number }> {
  const { data } = await apiClient.delete<{ id: string; likeCount: number }>(`/api/v1/posts/${id}/like`);
  return data;
}

export async function getUserPosts(username: string): Promise<Post[]> {
  const { data } = await apiClient.get<Post[]>(`/api/v1/posts/user/${username}`);
  return data;
}

export async function getLikedPosts(username: string): Promise<Post[]> {
  const { data } = await apiClient.get<Post[]>(`/api/v1/posts/liked/${username}`);
  return data;
}

export async function getOwnPosts(): Promise<Post[]> {
  const { data } = await apiClient.get<Post[]>("/api/v1/posts/me");
  return data;
}

export async function getPostsByAuthors(authorIds: string[], limit?: number): Promise<Post[]> {
  const { data } = await apiClient.get<Post[]>("/api/v1/posts", {
    params: { authorIds: authorIds.join(","), limit },
  });
  return data;
}
