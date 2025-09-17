"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type AuthUser = {
  id: number;
  email: string;
  full_name?: string | null;
  company?: string | null;
  subscription_tier?: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "okapiq_auth_token";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "");

  const fetchMe = useCallback(async (jwt: string) => {
    try {
      const res = await fetch(`${apiBase}/auth/me`, {
        headers: { Authorization: `Bearer ${jwt}` }
      });
      if (!res.ok) throw new Error("me_failed");
      const data = await res.json();
      setUser({
        id: data.id,
        email: data.email,
        full_name: data.full_name ?? null,
        company: data.company ?? null,
        subscription_tier: data.subscription_tier ?? null,
      });
    } catch {
      setUser(null);
    }
  }, [apiBase]);

  useEffect(() => {
    const existing = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!existing) {
      setLoading(false);
      return;
    }
    setToken(existing);
    fetchMe(existing).finally(() => setLoading(false));
  }, [fetchMe]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error("login_failed");
      const data = await res.json();
      const jwt = data?.access_token as string;
      if (!jwt) throw new Error("no_token");
      localStorage.setItem(STORAGE_KEY, jwt);
      setToken(jwt);
      await fetchMe(jwt);
    } finally {
      setLoading(false);
    }
  }, [apiBase, fetchMe]);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setToken(null);
    setUser(null);
  }, []);

  const refreshMe = useCallback(async () => {
    if (!token) return;
    await fetchMe(token);
  }, [token, fetchMe]);

  const value = useMemo<AuthContextValue>(() => ({ user, token, loading, login, logout, refreshMe }), [user, token, loading, login, logout, refreshMe]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}


