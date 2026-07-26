"use client";

import { useEffect, useRef } from "react";
import { useSession } from "./session-provider";

const REFRESH_MARGIN_MS = 10 * 60 * 1000; // refrescar 10 min antes de expirar

/**
 * Antes leía el "exp" decodificando la cookie. Ahora las cookies son httpOnly:
 * el "exp" llega en los claims de la sesión y la renovación la hace
 * /api/auth/refresh, que es quien tiene acceso al refreshToken.
 */
export function SessionRefresher() {
  const { session, reload, clear } = useSession();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Se guardan en refs para que el efecto no se reprograme en cada render.
  const reloadRef = useRef(reload);
  const clearRef = useRef(clear);

  reloadRef.current = reload;
  clearRef.current = clear;

  const expiresAt = session?.exp ? session.exp * 1000 : null;

  useEffect(() => {
    if (!expiresAt) return;

    const doRefresh = async () => {
      try {
        const res = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "same-origin",
        });

        if (!res.ok) {
          clearRef.current();
          return;
        }

        // Recarga los claims: el nuevo "exp" reprograma este efecto.
        await reloadRef.current();
      } catch {
        // Fallo de red: se reintenta en la próxima visita a la pestaña.
      }
    };

    const schedule = () => {
      if (timerRef.current) clearTimeout(timerRef.current);

      const msUntilRefresh = expiresAt - Date.now() - REFRESH_MARGIN_MS;

      if (msUntilRefresh <= 0) {
        void doRefresh();
        return;
      }

      timerRef.current = setTimeout(() => void doRefresh(), msUntilRefresh);
    };

    schedule();

    const onVisible = () => {
      if (
        document.visibilityState === "visible" &&
        Date.now() >= expiresAt - REFRESH_MARGIN_MS
      ) {
        void doRefresh();
      }
    };

    document.addEventListener("visibilitychange", onVisible);

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [expiresAt]);

  return null;
}
