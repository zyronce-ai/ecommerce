'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/use-auth';
import { SocketContext, connectSocket, disconnectSocket } from '@/lib/socket';
import type { Socket } from 'socket.io-client';

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const prevUserId = useRef<string | null>(null);

  useEffect(() => {
    const uid = user?.id || null;
    if (uid === prevUserId.current) return;
    prevUserId.current = uid;

    if (uid) {
      const s = connectSocket(uid);
      setSocket(s);
    } else {
      disconnectSocket();
      setSocket(null);
    }

    return () => {
      if (uid) disconnectSocket();
    };
  }, [user?.id]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}
