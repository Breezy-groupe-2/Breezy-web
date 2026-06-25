import apiClient from "@/lib/axios";
import type { Report, ReportReason, User } from "@/types";

interface ReportPayload {
  kind: "post" | "comment" | "user";
  reason: ReportReason;
  author: { username: string; displayName: string; avatarUrl?: string };
  postId?: string;
  text?: string;
}

/** File a report (Fx20). Open to any authenticated user. */
export async function reportContent(payload: ReportPayload): Promise<Report> {
  const { data } = await apiClient.post<Report>("/api/v1/moderation/reports", payload);
  return data;
}

/** Convenience: report a user/profile. */
export function reportUser(user: User, reason: ReportReason = "Contenu inapproprié") {
  return reportContent({
    kind: "user",
    reason,
    author: { username: user.username, displayName: user.displayName, avatarUrl: user.avatarUrl },
    text: user.bio?.trim() || `Profil @${user.username} signalé`,
  });
}
