import apiClient from "@/lib/axios";
import type { Post, PaginatedResponse } from "@/types";

export async function getFeed(): Promise<Post[]> {
  const { data } = await apiClient.get<PaginatedResponse<Post>>("/api/v1/posts");
  return data.data;
}
