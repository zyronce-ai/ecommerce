'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { setToken } from '@/lib/use-api';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export function AuthSync() {
  const { data: session } = useSession();
  const synced = useRef(false);

  useEffect(() => {
    if (session?.user?.email && !synced.current) {
      synced.current = true;
      fetch(`${API}/api/auth/social-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
        }),
      })
        .then(r => r.json())
        .then(data => {
          if (data.token) setToken(data.token);
        })
        .catch(() => {});
    }
  }, [session?.user?.email, session?.user?.name, session?.user?.image]);

  return null;
}
