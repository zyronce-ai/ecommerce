'use client';

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let messaging: Messaging | null = null;
let swConfigured = false;

export function isFirebaseConfigured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.messagingSenderId);
}

async function ensureServiceWorkerConfigured() {
  if (swConfigured) return;
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service workers are not supported in this browser');
  }

  const reg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
  await navigator.serviceWorker.ready;

  if (reg.active) {
    reg.active.postMessage({
      type: 'SET_FIREBASE_CONFIG',
      config: firebaseConfig,
    });
  }

  swConfigured = true;
}

export function initFirebase(): Messaging | null {
  if (typeof window === 'undefined') return null;
  if (!isFirebaseConfigured()) {
    console.error('[FCM] Firebase env vars not configured');
    return null;
  }
  if (messaging) return messaging;
  try {
    const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig as any) : getApps()[0];
    messaging = getMessaging(app);
    return messaging;
  } catch (err: any) {
    console.error('[FCM] initFirebase error:', err.message);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<string | null> {
  try {
    if (!isFirebaseConfigured()) {
      console.error('[FCM] Firebase not configured - check NEXT_PUBLIC_FIREBASE_* env vars');
      return null;
    }

    if (typeof Notification === 'undefined') {
      console.error('[FCM] Notification API not available');
      return null;
    }

    await ensureServiceWorkerConfigured();

    const permission = await Notification.requestPermission();
    console.log('[FCM] Permission result:', permission);
    if (permission !== 'granted') return null;

    const msg = initFirebase();
    if (!msg) return null;

    const token = await getToken(msg, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: await navigator.serviceWorker.ready,
    });
    console.log('[FCM] Token received:', token ? token.substring(0, 20) + '...' : 'null');
    return token;
  } catch (err: any) {
    console.error('[FCM] requestNotificationPermission error:', err.message || err);
    return null;
  }
}

export function onForegroundMessage(cb: (payload: any) => void) {
  const msg = initFirebase();
  if (!msg) return;
  onMessage(msg, cb);
}
