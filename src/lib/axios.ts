import axios, { isAxiosError } from "axios";

export { isAxiosError };

if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not set. Copy .env.example to .env.local and set a value.");
}

const TOKEN_KEY = "breezy_token";

export const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;

export const setToken = (token: string) => {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = () => {
  if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
};

let redirectingToLogin = false;

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !redirectingToLogin) {
      redirectingToLogin = true;
      removeToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
