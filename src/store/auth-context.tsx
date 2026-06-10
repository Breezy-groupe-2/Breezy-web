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
  const [state, setState] = useState<AuthState>(() => {
    const token = getToken();
    return {
      user: null,
      token,
      isLoading: Boolean(token),
    };
  });

  useEffect(() => {
    const token = getToken();
    if (!token) {
      return;
    }

    getMe()
      .then((user) => setState({ user, token, isLoading: false }))
      .catch(() => {
        removeToken();
        setState({ user: null, token: null, isLoading: false });
      });
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
