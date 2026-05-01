"use client";

import { useState, useEffect, useCallback } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: string;
}

const STORAGE_KEY = "moodquest_user";

function loadUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(loadUser());
    setLoading(false);
  }, []);

  const saveUser = useCallback((u: User) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const signupWithEmail = useCallback(async (name: string, email: string, password: string) => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Signup failed");
    saveUser(data);
    return data;
  }, [saveUser]);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    saveUser(data);
    return data;
  }, [saveUser]);

  const loginWithProvider = useCallback(async (provider: "google" | "microsoft" | "apple") => {
    // For MVP: create/login with mock email — in production: redirect to OAuth
    const mockEmail = `user_${Date.now()}@${provider}.com`;
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: mockEmail, provider }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    saveUser(data);
    return data;
  }, [saveUser]);

  return { user, loading, logout, signupWithEmail, loginWithEmail, loginWithProvider };
}
