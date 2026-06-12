import apiClient from "@/lib/axios";
import type { User, PaginatedResponse } from "@/types";

export async function followUser(username: string): Promise<void> {
  await apiClient.post(`/api/v1/users/${username}/follow`);
}

export async function unfollowUser(username: string): Promise<void> {
  await apiClient.delete(`/api/v1/users/${username}/follow`);
}

export async function getFollowers(username: string): Promise<User[]> {
  const { data } = await apiClient.get<PaginatedResponse<User>>(
    `/api/v1/users/${username}/followers`
  );
  return data.data;
}

export async function getFollowing(username: string): Promise<User[]> {
  const { data } = await apiClient.get<PaginatedResponse<User>>(
    `/api/v1/users/${username}/following`
  );
  return data.data;
}
