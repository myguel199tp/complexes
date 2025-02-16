import { io, Socket } from "socket.io-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const initializeSocket = (
  userId: string,
  name: string,
  nameUnit: string
): Socket => {
  return io(API_URL, {
    auth: { userId, name, nameUnit },
  });
};
