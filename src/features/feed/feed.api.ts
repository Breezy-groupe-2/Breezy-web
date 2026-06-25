import apiClient from "@/lib/axios";
import type { Post } from "@/types";

// "Mon feed" — posts from people the current user follows (chronological).
export async function getFeed(limit?: number): Promise<Post[]> {
  const { data } = await apiClient.get<Post[]>("/api/v1/feed", limit ? { params: { limit } } : undefined);
  return data;
}

// "Général" — every post on the platform (global timeline).
export async function getAllPosts(limit?: number): Promise<Post[]> {
  const { data } = await apiClient.get<Post[]>("/api/v1/posts/all", limit ? { params: { limit } } : undefined);
  return data;
}
