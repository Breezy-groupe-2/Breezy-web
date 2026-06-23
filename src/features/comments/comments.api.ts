import apiClient from "@/lib/axios";
import type { Comment, Reply } from "@/types";

export async function getComments(postId: string): Promise<Comment[]> {
  const { data } = await apiClient.get<Comment[]>(
    `/api/v1/posts/${postId}/comments`
  );
  return data;
}

export async function addComment(postId: string, content: string): Promise<Comment> {
  const { data } = await apiClient.post<Comment>(
    `/api/v1/posts/${postId}/comments`,
    { content }
  );
  return data;
}

export async function addReply(commentId: string, content: string): Promise<Reply> {
  const { data } = await apiClient.post<Reply>(
    `/api/v1/comments/${commentId}/replies`,
    { content }
  );
  return data;
}

export async function getReplies(commentId: string): Promise<Reply[]> {
  const { data } = await apiClient.get<Reply[]>(`/api/v1/comments/${commentId}/replies`);
  return data;
}
