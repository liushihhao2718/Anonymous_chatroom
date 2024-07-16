'use client';
import { io, Socket } from 'socket.io-client';
import React, { createContext, ReactNode, useContext } from 'react';

const SOCKET_URL =
  process.env.NODE_ENV === 'production' ? './' : 'http://localhost:3000';

export const socket = io(SOCKET_URL, {
  transports: ['websocket'],
});

const SocketContext = createContext<Socket>(socket);
SocketContext.displayName = 'SocketContext';



export const SocketProvider = ({ children }: { children: ReactNode }) => (
  <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
);

export const useSocket = () => {
  const context = useContext(SocketContext);
  return context;
};


type User = {
  id: string;
  nickname: string;
  room?: string;
};
// export function connect(nickname: string) {
//   if (socket?.connected) return;
//   return new Promise((reslove, reject) => {
//     socket = io(URL, {
//       autoConnect: false,
//     });
//     socket.emit('join', { nickname }, (error) => {
//       if (error) {
//         reject(error);
//       } else reslove(nickname);
//     });
//     socket.on('connect_error', (err) => {
//       reject(err);
//     });
//   });
// }
