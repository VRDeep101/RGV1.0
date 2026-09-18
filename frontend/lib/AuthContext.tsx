"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  AuthUser,
  getToken,
  saveToken,
  clearToken,
  fetchMe,
} from "./auth";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  setSession: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = getToken();

    if (!token) {
      // MVP demo: authentication optional
      setLoading(false);
      return;
    }

    fetchMe(token)
      .then((me) => {
        setUser(me);
      })
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  function setSession(token: string, authUser: AuthUser) {
    saveToken(token);
    setUser(authUser);
    router.replace("/");
  }

  function logout() {
    clearToken();
    setUser(null);
    router.replace("/");
  }

  return (
    <AuthContext.Provider value={{ user, loading, setSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return ctx;
}