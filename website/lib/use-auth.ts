'use client';

import { useState, useEffect, useCallback } from 'react';
import { getToken, clearToken } from '@/lib/use-api';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [tokenVersion, setTokenVersion] = useState(0);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data && data.id) {
          setUser({ id: data.id, name: data.name, email: data.email, image: data.image, role: data.role });
        } else {
          setUser(null);
          clearToken();
          document.cookie = 'token=; path=/; max-age=0';
        }
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tokenVersion]);

  const refetch = useCallback(() => setTokenVersion((v) => v + 1), []);

  const logout = useCallback(() => {
    clearToken();
    document.cookie = 'token=; path=/; max-age=0';
    setUser(null);
  }, []);

  return { user, loading, refetch, logout };
}
