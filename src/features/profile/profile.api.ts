import apiClient from "@/lib/axios";
import type { User } from "@/types";

export async function getProfile(username: string): Promise<User> {
  const { data } = await apiClient.get<User>(`/api/v1/users/${username}`);
  return data;
}

export async function updateProfile(payload: {
  displayName?: string;
  bio?: string;
}): Promise<User> {
  const { data } = await apiClient.patch<User>("/api/v1/users/me", payload);
  return data;
}
