"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { getToken, setToken, removeToken } from "@/lib/axios";
import { getMe } from "@/features/auth/auth.api";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Start in a loading state that is identical on the server and the first
  // client render (localStorage is unavailable during SSR, so reading the token
  // in the initializer would cause a hydration mismatch). The token is resolved
  // in the effect below, which only runs on the client.
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  useEffect(() => {
    const token = getToken();
    if (!token) {
      // Resolve on a microtask so we don't call setState synchronously inside the
      // effect body (the token comes from localStorage, available only on the client).
      queueMicrotask(() => setState({ user: null, token: null, isLoading: false }));
      return;
    }

    getMe()
      .then((user) => setState({ user, token, isLoading: false }))
      .catch(() => {
        removeToken();
        setState({ user: null, token: null, isLoading: false });
      });
  }, []);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== "breezy_token") return;
      if (!e.newValue) {
        setState({ user: null, token: null, isLoading: false });
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = useCallback((token: string, user: User) => {
    setToken(token);
    setState({ user, token, isLoading: false });
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setState({ user: null, token: null, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
