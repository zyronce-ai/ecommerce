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

export async function requestNotificationPermission(): Promise<{ token: string | null; error?: string }> {
  try {
    if (!isFirebaseConfigured()) {
      console.error('[FCM] Firebase not configured - check NEXT_PUBLIC_FIREBASE_* env vars');
      return { token: null, error: 'Firebase env vars not set' };
    }

    if (typeof Notification === 'undefined') {
      console.error('[FCM] Notification API not available');
      return { token: null, error: 'Notification API not available' };
    }

    if (!('serviceWorker' in navigator)) {
      console.error('[FCM] Service workers not supported');
      return { token: null, error: 'Service workers not supported' };
    }

    await ensureServiceWorkerConfigured();

    const permission = await Notification.requestPermission();
    console.log('[FCM] Permission result:', permission);
    if (permission !== 'granted') {
      return { token: null, error: 'Permission not granted' };
    }

    const msg = initFirebase();
    if (!msg) {
      return { token: null, error: 'Firebase messaging init failed' };
    }

    const swReg = await navigator.serviceWorker.ready;
    console.log('[FCM] SW active:', swReg.active?.state, 'scope:', swReg.scope);

    const token = await getToken(msg, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });
    console.log('[FCM] Token received:', token ? token.substring(0, 20) + '...' : 'null');
    return { token };
  } catch (err: any) {
    const msg = err?.message || String(err);
    const code = err?.code || 'unknown';
    console.error('[FCM] requestNotificationPermission error:', { code, message: msg });
    return { token: null, error: msg };
  }
}

export function onForegroundMessage(cb: (payload: any) => void) {
  const msg = initFirebase();
  if (!msg) return;
  onMessage(msg, cb);
}
