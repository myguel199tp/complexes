/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Visit } from "../services/response/visit";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

type ServerToClientEvents = {
  newVisit: (visit: Visit) => void;
  visitUpdated: (visit: Visit) => void;
};

type ClientToServerEvents = {
  joinConjunto: (conjuntoId: string) => void;
};

export function useVisitSocket({
  onNewVisit,
  onVisitUpdated,
}: {
  onNewVisit?: (visit: Visit) => void;
  onVisitUpdated?: (visit: Visit) => void;
}) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const socketRef = useRef<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!API_URL) return;
    if (!conjuntoId) return;

    // 🔥 SI YA EXISTE SOCKET, LO LIMPIAMOS (EVITA BUGS SILENCIOSOS)
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current.removeAllListeners();
      socketRef.current = null;
    }

    // 🔌 CREAR SOCKET NUEVO
    const socket = io(API_URL, {
      transports: ["websocket"],
      forceNew: true,
    });

    socketRef.current = socket;

    // 📡 DEBUG (MUY IMPORTANTE)
    socket.onAny((event, data) => {
      console.log("📡 SOCKET EVENT:", event, data);
    });

    socket.on("connect", () => {
      console.log("🟢 SOCKET CONECTADO");

      socket.emit("joinConjunto", conjuntoId);
      console.log("📥 JOIN ROOM:", conjuntoId);
    });

    socket.on("disconnect", (reason) => {
      console.warn("🔴 SOCKET DESCONECTADO:", reason);
    });

    socket.on("newVisit", (visit: Visit) => {
      console.log("🚨 NEW VISIT RECIBIDA:", visit);
      onNewVisit?.(visit);
    });

    socket.on("visitUpdated", (visit: Visit) => {
      console.log("🔄 VISIT UPDATED:", visit);
      onVisitUpdated?.(visit);
    });

    return () => {
      socket.disconnect();
    };
  }, [conjuntoId, API_URL]);
}
