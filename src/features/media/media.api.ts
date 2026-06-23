import apiClient from "@/lib/axios";

export async function uploadMedia(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post<{ url: string }>("/api/v1/media/upload", form);
  return data;
}
