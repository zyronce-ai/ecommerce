'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Bell, X } from 'lucide-react';
import { requestNotificationPermission, isFirebaseConfigured } from '@/lib/firebase';
import { useAuth } from '@/lib/use-auth';
import { getToken } from '@/lib/use-api';

export function NotificationBanner() {
  const { data: session } = useSession();
  const { user: customUser } = useAuth();
  const currentUser = customUser || session?.user;
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'default') setShow(true);
  }, []);

  async function handleEnable() {
    setError(null);

    if (!isFirebaseConfigured()) {
      setError('Push notifications not configured. Contact admin.');
      return;
    }

    if (typeof Notification === 'undefined') {
      setError('Your browser does not support notifications.');
      return;
    }

    if (!currentUser?.id) {
      setError('Please login to enable notifications.');
      return;
    }

    setLoading(true);
    try {
      const result = await requestNotificationPermission();
      if (!result.token) {
        const perm = typeof Notification !== 'undefined' ? Notification.permission : 'unknown';
        const errMsg = result.error || 'Unknown error';
        if (perm === 'denied') {
          setError('Notifications are blocked. Click the lock icon in address bar → Allow notifications.');
        } else if (errMsg.includes('push service')) {
          setError('Push service unreachable. Try: (1) Different browser, (2) Disable ad-blocker, (3) Incognito mode.');
        } else if (errMsg.includes('vapid')) {
          setError('VAPID key invalid. Regenerate in Firebase Console.');
        } else {
          setError(`Error: ${errMsg}`);
        }
        return;
      }
      const authToken = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/notifications/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ token: result.token, userId: currentUser.id, device: 'web' }),
      });
      if (!res.ok) {
        setError('Saved locally but server sync failed. Will retry later.');
        console.error('[FCM] Token save failed:', await res.text());
      }
      setShow(false);
    } catch (err: any) {
      setError('Error: ' + (err.message || 'Unknown'));
    } finally {
      setLoading(false);
    }
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-lg border bg-card p-4 shadow-lg">
      <div className="flex items-start gap-3">
        <Bell className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Stay updated!</p>
          <p className="text-xs text-muted-foreground">Get order updates & exclusive deals</p>
          {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
        </div>
        <div className="flex shrink-0 gap-1">
          <Button size="sm" onClick={handleEnable} disabled={loading}>
            {loading ? '...' : 'Enable'}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShow(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
