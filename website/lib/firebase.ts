import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

let messaging: Messaging | null = null;

export function initFirebase() {
  if (typeof window === 'undefined') return null;
  if (getApps().length === 0) {
    const app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
  } else {
    messaging = getMessaging(getApps()[0]);
  }
  return messaging;
}

export async function requestNotificationPermission(): Promise<string | null> {
  try {
    const msg = initFirebase();
    if (!msg) return null;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;

    const token = await getToken(msg, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });
    return token;
  } catch {
    return null;
  }
}

export function onForegroundMessage(cb: (payload: any) => void) {
  const msg = initFirebase();
  if (!msg) return;
  onMessage(msg, cb);
}
