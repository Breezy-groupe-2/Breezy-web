import apiClient from "@/lib/axios";
import type { Comment, PaginatedResponse } from "@/types";

export async function getComments(postId: number): Promise<Comment[]> {
  const { data } = await apiClient.get<PaginatedResponse<Comment>>(
    `/api/v1/posts/${postId}/comments`
  );
  return data.data;
}

export async function addComment(postId: number, content: string): Promise<Comment> {
  const { data } = await apiClient.post<Comment>(
    `/api/v1/posts/${postId}/comments`,
    { content }
  );
  return data;
}

export async function addReply(commentId: number, content: string): Promise<Comment> {
  const { data } = await apiClient.post<Comment>(
    `/api/v1/comments/${commentId}/replies`,
    { content }
  );
  return data;
}
