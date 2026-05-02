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
    if (!conjuntoId) return;

    if (!socketRef.current) {
      console.log("🔌 Conectando socket...");

      socketRef.current = io(API_URL, {
        transports: ["websocket"],
      });
    }

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("✅ Socket conectado:", socket.id);

      socket.emit("joinConjunto", conjuntoId);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket desconectado");
    });

    const handleNewVisit = (visit: Visit) => {
      console.log("🔥 EVENTO newVisit:", visit);
      onNewVisit?.(visit);
    };

    const handleVisitUpdated = (visit: Visit) => {
      console.log("🔄 EVENTO visitUpdated:", visit);
      onVisitUpdated?.(visit);
    };

    socket.on("newVisit", handleNewVisit);
    socket.on("visitUpdated", handleVisitUpdated);

    return () => {
      socket.off("newVisit", handleNewVisit);
      socket.off("visitUpdated", handleVisitUpdated);
    };
  }, [conjuntoId]);
}
