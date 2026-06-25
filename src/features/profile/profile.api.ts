import apiClient from "@/lib/axios";
import type { User } from "@/types";

export async function getProfile(username: string): Promise<User> {
  const { data } = await apiClient.get<User>(`/api/v1/users/${username}`);
  return data;
}

export async function updateProfile(payload: {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
}): Promise<User> {
  const { data } = await apiClient.put<User>("/api/v1/users/me", payload);
  return data;
}

export async function updatePreferences(payload: { theme: { mode: "light" | "dark"; accentColor: string } }): Promise<User> {
  const { data } = await apiClient.patch<User>("/api/v1/users/me/preferences", payload);
  return data;
}
