/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

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

    const socket = io(API_URL, {
      transports: ["websocket"],
      forceNew: true,
      auth: { conjuntos: [conjuntoId] },
    });

    socketRef.current = socket;

    socket.on("emergencyActivated", (payload: EmergencyActivatedPayload) => {
      onActivated?.(payload);
    });

    socket.on("emergencyResolved", (payload: EmergencyResolvedPayload) => {
      onResolved?.(payload);
    });

    return () => {
      socket.disconnect();
    };
  }, [conjuntoId, API_URL]);
}
