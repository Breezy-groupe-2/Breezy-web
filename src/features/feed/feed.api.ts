import apiClient from "@/lib/axios";
import type { Post } from "@/types";

export async function getFeed(limit?: number): Promise<Post[]> {
  const { data } = await apiClient.get<Post[]>("/api/v1/feed", limit ? { params: { limit } } : undefined);
  return data;
}
