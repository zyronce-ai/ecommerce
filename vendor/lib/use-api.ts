'use client';

import { useState, useEffect, useCallback } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function setToken(token: string) {
  localStorage.setItem('token', token);
}

export function setVendorId(id: string) {
  localStorage.setItem('vendorId', id);
}

export function getVendorId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('vendorId');
}

export function clearToken() {
  localStorage.removeItem('token');
  localStorage.removeItem('vendorId');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as any) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function useApi<T>(path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    setError(null);
    try {
      const result = await apiFetch<T>(path);
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => { refetch(); }, [refetch]);

  return { data, loading, error, refetch };
}

export function apiPost<T>(path: string, body?: any) {
  return apiFetch<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
}

export function apiPut<T>(path: string, body?: any) {
  return apiFetch<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined });
}

export function apiDelete<T>(path: string) {
  return apiFetch<T>(path, { method: 'DELETE' });
}
