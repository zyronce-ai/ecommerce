'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { Bell, Check, X, Trash2, Package, Tag, TrendingDown, Info, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/use-auth';
import { apiGet, apiPost, apiDelete } from '@/lib/use-api';
import { useSocket } from '@/lib/socket';
import { NotificationModal } from './notification-modal';

type NotifType = 'ORDER' | 'DEAL' | 'PRICE' | 'SYSTEM';

interface Notification {
  _id: string;
  userId: string;
  title: string;
  body: string;
  type: NotifType;
  read: boolean;
  data?: any;
  link?: string;
  createdAt: string;
  updatedAt: string;
}

const ICONS: Record<NotifType, any> = {
  ORDER: Package,
  DEAL: Tag,
  PRICE: TrendingDown,
  SYSTEM: Info,
};

const ICON_COLORS: Record<NotifType, string> = {
  ORDER: 'text-blue-500',
  DEAL: 'text-pink-500',
  PRICE: 'text-orange-500',
  SYSTEM: 'text-gray-500',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Notification | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const socket = useSocket();

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiGet<{ success: boolean; items: Notification[]; unread: number }>(
        '/api/notifications?limit=20'
      );
      setItems(res.items || []);
      setUnread(res.unread || 0);
    } catch (err: any) {
      console.error('[bell] fetch error', err);
      setError(err?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  useEffect(() => {
    if (!socket) return;

    function onNotification(data: { action: string; notification: Notification }) {
      if (data.action === 'new' && data.notification) {
        const n = data.notification;
        setItems((prev) => [n, ...prev].slice(0, 50));
        setUnread((u) => u + 1);

        if (typeof Notification !== 'undefined' && Notification.permission === 'granted' && n.title) {
          try {
            const popup = new Notification(n.title, {
              body: n.body,
              icon: '/icon.svg',
              tag: n._id,
            });
            popup.onclick = () => {
              window.focus();
              if (n.link) window.location.href = n.link;
            };
          } catch (e) {
            /* browser notification failed, still in bell */
          }
        }
      }
    }

    socket.on('notification', onNotification);
    return () => {
      socket.off('notification', onNotification);
    };
  }, [socket]);

  useEffect(() => {
    function onClickOutside(e: globalThis.MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  async function markRead(id: string) {
    setItems((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
    try {
      await apiPost(`/api/notifications/${id}/read`, {});
    } catch (err) {
      console.error('[bell] mark read failed', err);
    }
  }

  async function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
    try {
      await apiPost('/api/notifications/mark-all-read', {});
    } catch (err) {
      console.error('[bell] mark all failed', err);
    }
  }

  async function removeNotif(id: string, e: ReactMouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    const wasUnread = items.find((n) => n._id === id)?.read === false;
    setItems((prev) => prev.filter((n) => n._id !== id));
    if (wasUnread) setUnread((u) => Math.max(0, u - 1));
    try {
      await apiDelete(`/api/notifications/${id}`);
    } catch (err) {
      console.error('[bell] delete failed', err);
    }
  }

  function handleItemClick(n: Notification) {
    setSelected(n);
    setModalOpen(true);
  }

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((o) => !o)}
        className="relative"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <Badge
            variant="destructive"
            className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full p-0 text-[10px] flex items-center justify-center"
          >
            {unread > 99 ? '99+' : unread}
          </Badge>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-lg border bg-white shadow-lg dark:bg-gray-950 dark:border-gray-800 max-h-[70vh] flex flex-col">
          <div className="flex items-center justify-between p-3 border-b dark:border-gray-800">
            <h3 className="font-semibold text-sm">Notifications</h3>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchNotifications}
                className="h-7 text-xs"
                title="Refresh"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {unread > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllRead}
                  className="h-7 text-xs"
                  title="Mark all as read"
                >
                  <Check className="h-3 w-3 mr-1" />
                  Mark all
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                className="h-7 w-7"
                title="Close"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading && items.length === 0 && (
              <div className="p-8 text-center text-sm text-gray-500">Loading...</div>
            )}
            {error && items.length === 0 && (
              <div className="p-8 text-center text-sm text-red-500">{error}</div>
            )}
            {!loading && !error && items.length === 0 && (
              <div className="p-8 text-center text-sm text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                No notifications yet
              </div>
            )}
            {items.map((n) => {
              const Icon = ICONS[n.type] || Info;
              const color = ICON_COLORS[n.type] || 'text-gray-500';
              const inner = (
                <div
                  className={`flex gap-3 p-3 border-b dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer ${
                    !n.read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''
                  }`}
                  onClick={() => handleItemClick(n)}
                >
                  <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm truncate">{n.title}</p>
                      {!n.read && (
                        <span className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-0.5">
                      {n.body}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-50 hover:opacity-100"
                    onClick={(e) => removeNotif(n._id, e)}
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              );
              return <div key={n._id}>{inner}</div>;
            })}
          </div>
        </div>
      )}

      <NotificationModal
        notification={selected}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onMarkRead={markRead}
      />
    </div>
  );
}
