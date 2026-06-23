import apiClient from "@/lib/axios";
import type { Post } from "@/types";

export async function getPost(id: string): Promise<Post> {
  const { data } = await apiClient.get<Post>(`/api/v1/posts/${id}`);
  return data;
}

export async function createPost(content: string, mediaUrl?: string): Promise<Post> {
  const { data } = await apiClient.post<Post>("/api/v1/posts", { content, mediaUrl });
  return data;
}

export async function updatePost(id: string, content: string): Promise<Post> {
  const { data } = await apiClient.put<Post>(`/api/v1/posts/${id}`, { content });
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
