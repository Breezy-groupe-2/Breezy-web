import apiClient from "@/lib/axios";
import type { User } from "@/types";

export async function getSuggestions(): Promise<User[]> {
  const { data } = await apiClient.get<User[]>("/api/v1/users/suggestions");
  return data;
}

export async function followUser(username: string): Promise<void> {
  await apiClient.post(`/api/v1/users/${username}/follow`);
}

export async function unfollowUser(username: string): Promise<void> {
  await apiClient.delete(`/api/v1/users/${username}/follow`);
}

export async function getFollowers(username: string): Promise<User[]> {
  const { data } = await apiClient.get<User[]>(
    `/api/v1/users/${username}/followers`
  );
  return data;
}

export async function getFollowing(username: string): Promise<User[]> {
  const { data } = await apiClient.get<User[]>(
    `/api/v1/users/${username}/following`
  );
  return data;
}
