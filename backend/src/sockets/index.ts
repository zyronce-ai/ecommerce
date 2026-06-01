import { Server as SocketServer } from 'socket.io';

export function setupSocket(io: SocketServer) {
  io.on('connection', (socket) => {
    console.log('[WS] User connected:', socket.id);

    socket.on('join-chat', (chatId: string) => {
      socket.join(chatId);
    });

    socket.on('send-message', (data: { chatId: string; message: string; sender: string }) => {
      io.to(data.chatId).emit('new-message', data);
    });

    socket.on('disconnect', () => {
      console.log('[WS] User disconnected:', socket.id);
    });
  });
}
