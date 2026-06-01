'use client';

import { useEffect, useRef } from 'react';

export function FirebaseInit() {
  const done = useRef(false);

  useEffect(() => {
    if (done.current || typeof window === 'undefined') return;
    done.current = true;

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((reg) => {
          navigator.serviceWorker.ready.then(() => {
            if (reg.active) {
              reg.active.postMessage({
                type: 'SET_FIREBASE_CONFIG',
                config: {
                  FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
                  FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
                  FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                  FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
                  FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
                },
              });
            }
          });
        })
        .catch(() => {});
    }
  }, []);

  return null;
}
