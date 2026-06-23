import apiClient from "@/lib/axios";
import type { Post, PaginatedResponse } from "@/types";

export async function getAllPosts(): Promise<Post[]> {
  const { data } = await apiClient.get<PaginatedResponse<Post>>("/api/v1/posts");
  return data.data;
}

export async function getPost(id: number): Promise<Post> {
  const { data } = await apiClient.get<Post>(`/api/v1/posts/${id}`);
  return data;
}

export async function createPost(content: string, mediaUrl?: string): Promise<Post> {
  const { data } = await apiClient.post<Post>("/api/v1/posts", { content, mediaUrl });
  return data;
}

export async function updatePost(id: number, content: string): Promise<Post> {
  const { data } = await apiClient.patch<Post>(`/api/v1/posts/${id}`, { content });
  return data;
}

export async function deletePost(id: number): Promise<void> {
  await apiClient.delete(`/api/v1/posts/${id}`);
}

export async function likePost(id: number): Promise<void> {
  await apiClient.post(`/api/v1/posts/${id}/likes`);
}

export async function unlikePost(id: number): Promise<void> {
  await apiClient.delete(`/api/v1/posts/${id}/likes`);
}

export async function getUserPosts(username: string): Promise<Post[]> {
  const { data } = await apiClient.get<PaginatedResponse<Post>>(
    `/api/v1/users/${username}/posts`
  );
  return data.data;
}
