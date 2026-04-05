"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { Visit } from "../services/response/visit";

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

  useEffect(() => {
    if (!conjuntoId) return;

    // ✅ Crear socket solo una vez
    if (!socketRef.current) {
      socketRef.current = io(process.env.NEXT_PUBLIC_API_URL!);
    }

    const socket = socketRef.current;

    socket.emit("joinConjunto", conjuntoId);

    const handleNewVisit = (visit: Visit) => {
      onNewVisit?.(visit);
    };

    const handleVisitUpdated = (visit: Visit) => {
      onVisitUpdated?.(visit);
    };

    socket.on("newVisit", handleNewVisit);
    socket.on("visitUpdated", handleVisitUpdated);

    return () => {
      socket.off("newVisit", handleNewVisit);
      socket.off("visitUpdated", handleVisitUpdated);
    };
  }, [conjuntoId, onNewVisit, onVisitUpdated]); // 👈 IMPORTANTE: ya no dependes de las funciones
}
