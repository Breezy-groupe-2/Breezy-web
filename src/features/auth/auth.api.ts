import apiClient from "@/lib/axios";
import type { AuthResponse, User } from "@/types";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  username: string;
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/api/v1/auth/login", payload);
  return data;
}

export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/api/v1/auth/register", payload);
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<User>("/api/v1/users/me");
  return data;
}
