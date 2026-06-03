'use client';

import { createContext, useContext } from 'react';
import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const SocketContext = createContext<Socket | null>(null);
export function useSocket() {
  return useContext(SocketContext);
}

let socket: Socket | null = null;

export function connectSocket(userId: string): Socket {
  if (socket?.connected) {
    socket.emit('join-notifications', userId);
    return socket;
  }

  socket = io(API_URL, {
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id);
    socket?.emit('join-notifications', userId);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

