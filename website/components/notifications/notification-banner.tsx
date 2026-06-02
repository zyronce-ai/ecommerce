'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Bell, X } from 'lucide-react';
import { requestNotificationPermission } from '@/lib/firebase';
import { useAuth } from '@/lib/use-auth';
import { getToken } from '@/lib/use-api';

export function NotificationBanner() {
  const { data: session } = useSession();
  const { user: customUser } = useAuth();
  const currentUser = customUser || session?.user;
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'default') setShow(true);
  }, []);

  async function handleEnable() {
    setLoading(true);
    const token = await requestNotificationPermission();
    if (token && currentUser?.id) {
      const authToken = getToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/notifications/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
        body: JSON.stringify({ token, userId: currentUser.id, device: 'web' }),
      });
    }
    setLoading(false);
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-lg border bg-card p-4 shadow-lg">
      <div className="flex items-start gap-3">
        <Bell className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Stay updated!</p>
          <p className="text-xs text-muted-foreground">Get order updates & exclusive deals</p>
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
