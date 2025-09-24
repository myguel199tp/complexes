import { io, Socket } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const initializeSocket = (
  userId: string,
  name: string,
  conjuntos?: string[] // 👈 lista de IDs de conjuntos donde está el usuario
): Socket => {
  return io(API_URL, {
    auth: { userId, name, conjuntos },
  });
};
