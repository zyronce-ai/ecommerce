'use client';

import { useEffect, useRef } from 'react';

export function FirebaseInit() {
  const done = useRef(false);

  useEffect(() => {
    if (done.current || typeof window === 'undefined') return;
    done.current = true;

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js').catch((err) => {
        console.warn('[SW] Register failed:', err.message);
      });
    }
  }, []);

  return null;
}
