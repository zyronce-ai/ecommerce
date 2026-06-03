import { Server as SocketServer, Socket } from 'socket.io';

export function setupSocket(io: SocketServer) {
  io.on('connection', (socket: Socket) => {
    console.log('[WS] User connected:', socket.id);

    socket.on('join-chat', (chatId: string) => {
      socket.join(chatId);
    });

    socket.on('send-message', (data: { chatId: string; message: string; sender: string }) => {
      io.to(data.chatId).emit('new-message', data);
    });

    socket.on('join-notifications', (userId: string) => {
      if (userId) {
        socket.join(`notifications:${userId}`);
        console.log('[WS] User joined notifications room:', userId);
      }
    });

    socket.on('leave-notifications', (userId: string) => {
      if (userId) {
        socket.leave(`notifications:${userId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log('[WS] User disconnected:', socket.id);
    });
  });
}
