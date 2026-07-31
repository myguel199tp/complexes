/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { fetchWsTicket } from "@/app/components/ui/citofonie-message/socket";

export type EmergencyActivatedPayload = {
  emergencyId: string;
  type: string;
  customTypeLabel?: string;
  instructions?: string;
  evacuationRoute?: string;
  meetingPoint?: string;
  title: string;
  body: string;
};

export type EmergencyResolvedPayload = {
  emergencyId: string;
};

type ServerToClientEvents = {
  emergencyActivated: (payload: EmergencyActivatedPayload) => void;
  emergencyResolved: (payload: EmergencyResolvedPayload) => void;
};

export function useEmergencySocket({
  onActivated,
  onResolved,
}: {
  onActivated?: (payload: EmergencyActivatedPayload) => void;
  onResolved?: (payload: EmergencyResolvedPayload) => void;
}) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const socketRef = useRef<Socket<ServerToClientEvents> | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!API_URL || !conjuntoId) return;

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current.removeAllListeners();
      socketRef.current = null;
    }

    // Las alertas llegan a la sala `conjunto:<id>`, a la que el servidor une
    // según los conjuntos del token. Antes `conjuntos` iba en el handshake sin
    // verificar, así que cualquiera podía escuchar las emergencias de cualquier
    // conjunto poniendo su id aquí.
    const socket = io(API_URL, {
      transports: ["websocket"],
      forceNew: true,
      autoConnect: false,
    });

    socketRef.current = socket;

    let cancelled = false;

    void fetchWsTicket().then((ticket) => {
      if (cancelled || !ticket) {
        if (!ticket) {
          console.error("Sin ticket: el socket de emergencias no conecta");
        }
        return;
      }

      socket.auth = { token: ticket };
      socket.connect();
    });

    socket.on("emergencyActivated", (payload: EmergencyActivatedPayload) => {
      onActivated?.(payload);
    });

    socket.on("emergencyResolved", (payload: EmergencyResolvedPayload) => {
      onResolved?.(payload);
    });

    return () => {
      cancelled = true;
      socket.disconnect();
    };
  }, [conjuntoId, API_URL]);
}
