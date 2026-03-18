import { io, Socket } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const initializeSocket = (
  userId: string,
  name: string,
  conjuntos?: string[],
): Socket => {
  return io(API_URL, {
    auth: { userId, name, conjuntos },
  });
};
