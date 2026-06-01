const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export async function api<T = any>(
  path: string,
  options: RequestInit & { params?: Record<string, string> } = {},
): Promise<T> {
  const { params, ...fetchOptions } = options;
  let url = `${API_BASE}${path}`;
  if (params) {
    const qs = new URLSearchParams(params).toString();
    url += `?${qs}`;
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, { ...fetchOptions, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

export const apiClient = {
  get: <T>(path: string, params?: Record<string, string>) =>
    api<T>(path, { method: 'GET', params }),

  post: <T>(path: string, body?: any) =>
    api<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),

  put: <T>(path: string, body?: any) =>
    api<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),

  delete: <T>(path: string) =>
    api<T>(path, { method: 'DELETE' }),
};
