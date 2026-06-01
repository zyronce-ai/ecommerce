'use client';

import { useEffect } from 'react';
import { NotificationBanner } from './notification-banner';

export function SWRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/firebase-messaging-sw.js').catch(() => {});
    }
  }, []);

  return <NotificationBanner />;
}
