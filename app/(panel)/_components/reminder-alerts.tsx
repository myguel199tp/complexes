"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { AnimatePresence, motion } from "framer-motion";

import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { fetchWsTicket } from "@/app/components/ui/citofonie-message/socket";

type ReminderDuePayload = {
  reminderId: string;
  conjuntoId: string;
  message: string;
  recurrence: "daily" | "weekly" | "monthly" | null;
};

type ServerToClientEvents = {
  reminderDue: (payload: ReminderDuePayload) => void;
};

const RECURRENCE_LABEL: Record<NonNullable<ReminderDuePayload["recurrence"]>, string> = {
  daily: "Se repite todos los días",
  weekly: "Se repite cada semana",
  monthly: "Se repite cada mes",
};

/** Más de esto en pantalla ya es ruido: se quedan los más recientes. */
const MAX_VISIBLE = 3;

/**
 * Pide permiso para las notificaciones del sistema. Se llama justo después de
 * crear un recordatorio desde el asistente: es cuando el usuario entiende para
 * qué es, y pedirlo al abrir el panel es la forma más segura de que lo niegue.
 */
export function requestReminderNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "default") return;
  void Notification.requestPermission().catch(() => {});
}

/**
 * Avisos de los recordatorios del asistente en el computador.
 *
 * El backend solo mandaba push al celular, así que quien pedía el recordatorio
 * desde el panel no se enteraba si no tenía el teléfono a mano. Llega por el
 * socket a la sala `user:<id>`, la misma en todas las pestañas abiertas.
 *
 * Con la pestaña al frente basta la tarjeta y el sonido; si está en segundo
 * plano se lanza además la notificación del sistema, porque una tarjeta en una
 * pestaña que nadie mira no avisa de nada.
 */
export default function ReminderAlerts() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const [alerts, setAlerts] = useState<ReminderDuePayload[]>([]);
  const socketRef = useRef<Socket<ServerToClientEvents> | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (!API_URL || !conjuntoId) return;

    const socket: Socket<ServerToClientEvents> = io(API_URL, {
      transports: ["websocket"],
      forceNew: true,
      autoConnect: false,
    });
    socketRef.current = socket;

    let cancelled = false;

    void fetchWsTicket().then((ticket) => {
      if (cancelled || !ticket) return;
      socket.auth = { token: ticket };
      socket.connect();
    });

    socket.on("reminderDue", (payload) => {
      setAlerts((current) =>
        [...current.filter((a) => a.reminderId !== payload.reminderId), payload].slice(
          -MAX_VISIBLE,
        ),
      );

      const audio = new Audio("/sounds/notification.mp3");
      audio.play().catch(() => {});

      if (
        document.visibilityState !== "visible" &&
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        const notification = new Notification("⏰ Recordatorio", {
          body: payload.message,
          tag: `reminder-${payload.reminderId}`,
        });
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }
    });

    return () => {
      cancelled = true;
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [conjuntoId, API_URL]);

  const dismiss = (reminderId: string) =>
    setAlerts((current) => current.filter((a) => a.reminderId !== reminderId));

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[9999] flex w-[min(92vw,360px)] flex-col gap-2"
      aria-live="assertive"
    >
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.reminderId}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.2 }}
            role="alert"
            className="pointer-events-auto rounded-2xl border border-cyan-400/30 bg-slate-900/95 p-4 text-white shadow-2xl backdrop-blur"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl" aria-hidden="true">
                ⏰
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
                  Recordatorio
                </p>
                <p className="mt-1 break-words text-sm font-medium">{alert.message}</p>
                {alert.recurrence ? (
                  <p className="mt-1 text-xs text-slate-400">
                    {RECURRENCE_LABEL[alert.recurrence]}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={() => dismiss(alert.reminderId)}
                className="rounded-lg bg-cyan-500/20 px-3 py-1.5 text-xs font-medium text-cyan-100 transition hover:bg-cyan-500/30"
              >
                Listo
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
