"use client";

import { useEffect } from "react";
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

let socket: Socket<ServerToClientEvents, ClientToServerEvents>;

export function useVisitSocket(onEvent?: (visit: Visit) => void) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  useEffect(() => {
    if (!conjuntoId) return;

    socket = io(process.env.NEXT_PUBLIC_API_URL!);

    socket.emit("joinConjunto", conjuntoId);

    socket.on("newVisit", (visit) => {
      onEvent?.(visit);
    });

    socket.on("visitUpdated", (visit) => {
      onEvent?.(visit);
    });

    return () => {
      socket.disconnect();
    };
  }, [conjuntoId, onEvent]);
}
