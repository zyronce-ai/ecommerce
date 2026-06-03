'use client';

import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Package, Tag, TrendingDown, Info, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type NotifType = 'ORDER' | 'DEAL' | 'PRICE' | 'SYSTEM';

interface Notification {
  _id: string;
  title: string;
  body: string;
  type: NotifType;
  read: boolean;
  data?: any;
  link?: string;
  createdAt: string;
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

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface Props {
  notification: Notification | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkRead: (id: string) => void;
}

export function NotificationModal({ notification, open, onOpenChange, onMarkRead }: Props) {
  if (!notification) return null;

  const Icon = ICONS[notification.type] || Info;
  const color = ICON_COLORS[notification.type] || 'text-gray-500';

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-w-md w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-white p-6 shadow-lg dark:bg-gray-950 dark:border-gray-800 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
          <Dialog.Close asChild>
            <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-7 w-7">
              <X className="h-4 w-4" />
            </Button>
          </Dialog.Close>

          <div className="flex items-start gap-3 mb-4">
            <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800 ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <Dialog.Title className="text-lg font-semibold leading-tight">
                {notification.title}
              </Dialog.Title>
              <p className="text-xs text-gray-500 mt-1">{formatTime(notification.createdAt)}</p>
            </div>
          </div>

          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
            {notification.body}
          </p>

          {notification.link && (
            <div className="mt-4 flex gap-2">
              <Link href={notification.link} onClick={() => onOpenChange(false)}>
                <Button size="sm" className="gap-1">
                  <ExternalLink className="h-3.5 w-3.5" />
                  View Details
                </Button>
              </Link>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onMarkRead(notification._id);
                onOpenChange(false);
              }}
            >
              Got it
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
