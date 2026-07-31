/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Visit } from "../services/response/visit";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { fetchWsTicket } from "@/app/components/ui/citofonie-message/socket";

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
    // Sin conectar todavía: el backend ahora exige un token en el handshake, así
    // que se conecta cuando llega el ticket. Antes `joinConjunto` aceptaba
    // cualquier id sin autenticar y se recibían las visitas de otros conjuntos.
    const socket = io(API_URL, {
      transports: ["websocket"],
      forceNew: true,
      autoConnect: false,
    });

    socketRef.current = socket;

    let cancelled = false;

    void fetchWsTicket().then((ticket) => {
      if (cancelled || !ticket) {
        if (!ticket) console.error("Sin ticket: el socket de visitas no conecta");
        return;
      }

      socket.auth = { token: ticket };
      socket.connect();
    });

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
      cancelled = true;
      socket.disconnect();
    };
  }, [conjuntoId, API_URL]);
}
