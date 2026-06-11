import apiClient from "@/lib/axios";
import type { Report, UserStatus } from "@/types";

export async function getReports(): Promise<Report[]> {
  const { data } = await apiClient.get<Report[]>("/api/moderation/reports");
  return data;
}

export async function dismissReport(id: string): Promise<void> {
  await apiClient.post(`/api/moderation/reports/${id}/dismiss`);
}

export async function deleteContent(reportId: string): Promise<void> {
  await apiClient.delete(`/api/moderation/content/${reportId}`);
}

export async function getModAccounts(): Promise<Record<string, UserStatus>> {
  const { data } = await apiClient.get<Record<string, UserStatus>>("/api/moderation/accounts");
  return data;
}

export async function setAccountStatus(username: string, status: UserStatus): Promise<void> {
  await apiClient.patch(`/api/moderation/accounts/${username}`, { status });
}
