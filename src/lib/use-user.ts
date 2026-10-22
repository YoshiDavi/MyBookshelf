"use client";

import { useEffect, useState } from "react";

export type User = {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
};

type State = {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

export function useUser(): State {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchUser() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  return { user, loading, refresh: fetchUser };
}