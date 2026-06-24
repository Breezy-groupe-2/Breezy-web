import apiClient from "@/lib/axios";

export async function uploadMedia(file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append("file", file);
  // Override the Axios instance default (`application/json`): with that header
  // Axios serializes the FormData to JSON and the upload breaks. Forcing
  // multipart lets Axios/the browser set the proper boundary.
  const { data } = await apiClient.post<{ url: string }>("/api/v1/media/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
