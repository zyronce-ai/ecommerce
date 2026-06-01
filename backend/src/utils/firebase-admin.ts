import admin from 'firebase-admin';

let fcm: admin.messaging.Messaging | null = null;

export function initFirebaseAdmin() {
  if (fcm) return fcm;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('[FCM] ⚠️ Firebase Admin not configured');
    return null;
  }

  try {
    const app = admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey: privateKey.replace(/\\n/g, '\n') }),
    });
    fcm = app.messaging();
    console.log('[FCM] ✅ Firebase Admin initialized');
    return fcm;
  } catch (err: any) {
    console.warn('[FCM] ⚠️ Failed to init Firebase Admin:', err.message);
    return null;
  }
}

export async function sendPushNotification(token: string, payload: { title: string; body: string; data?: Record<string, string> }) {
  const messenger = initFirebaseAdmin();
  if (!messenger) return;

  try {
    await messenger.send({ token, notification: { title: payload.title, body: payload.body }, data: payload.data });
  } catch (err: any) {
    if (err.code === 'messaging/registration-token-not-registered') return 'TOKEN_INVALID';
    console.error('[FCM] Send error:', err.message);
  }
}
