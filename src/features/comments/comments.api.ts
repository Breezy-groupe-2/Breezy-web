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

export async function likeComment(id: string): Promise<{ id: string; likeCount: number }> {
  const { data } = await apiClient.post<{ id: string; likeCount: number }>(
    `/api/v1/comments/${id}/like`
  );
  return data;
}

export async function unlikeComment(id: string): Promise<{ id: string; likeCount: number }> {
  const { data } = await apiClient.delete<{ id: string; likeCount: number }>(
    `/api/v1/comments/${id}/like`
  );
  return data;
}

export async function deleteComment(postId: string, commentId: string): Promise<void> {
  await apiClient.delete(`/api/v1/posts/${postId}/comments/${commentId}`);
}

export async function deleteReply(commentId: string, replyId: string): Promise<void> {
  await apiClient.delete(`/api/v1/comments/${commentId}/replies/${replyId}`);
}
