import apiClient from "@/lib/axios";
import type { ModAccount, Report, UserStatus } from "@/types";

export async function getReports(): Promise<Report[]> {
  const { data } = await apiClient.get<Report[]>("/api/v1/moderation/reports");
  return data;
}

export async function dismissReport(id: string): Promise<void> {
  await apiClient.post(`/api/v1/moderation/reports/${id}/dismiss`);
}

export async function deleteContent(reportId: string): Promise<void> {
  await apiClient.delete(`/api/v1/moderation/content/${reportId}`);
}

export async function getModAccounts(): Promise<ModAccount[]> {
  const { data } = await apiClient.get<ModAccount[]>("/api/v1/moderation/accounts");
  return data;
}

export async function setAccountStatus(username: string, status: UserStatus): Promise<void> {
  await apiClient.patch(`/api/v1/users/${username}/moderation`, { status, reason: "Moderation action" });
}
