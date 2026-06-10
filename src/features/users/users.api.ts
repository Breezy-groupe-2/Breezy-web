import apiClient from "@/lib/axios";

export async function followUser(username: string): Promise<void> {
  await apiClient.post(`/api/v1/users/${username}/follow`);
}

export async function unfollowUser(username: string): Promise<void> {
  await apiClient.delete(`/api/v1/users/${username}/follow`);
}
