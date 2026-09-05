"use client";

import { useEffect, useState } from "react";

export type DeliverySession = {
  id: string;
  email: string;
  exp: number;
};

/**
 * La cookie de delivery es httpOnly: el navegador ya no puede leerla. La
 * existencia de sesión se consulta al servidor, que valida la firma.
 */
export async function fetchDeliverySession(): Promise<DeliverySession | null> {
  try {
    const res = await fetch("/api/delivery/session", {
      cache: "no-store",
      credentials: "same-origin",
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data?.session ?? null;
  } catch {
    return null;
  }
}

export async function clearDeliveryToken(): Promise<void> {
  try {
    await fetch("/api/delivery/logout", {
      method: "POST",
      credentials: "same-origin",
    });
  } catch {
    // Si falla la red, la cookie caduca sola a las 24h.
  }
}

type GuardState = {
  /** null mientras se resuelve; luego la sesión o false si no hay. */
  session: DeliverySession | null;
  isLoading: boolean;
};

/**
 * Guarda de las pantallas del repartidor: redirige al login cuando el servidor
 * dice que no hay sesión.
 */
export function useDeliveryGuard(
  onUnauthenticated: () => void,
): GuardState {
  const [session, setSession] = useState<DeliverySession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchDeliverySession().then((result) => {
      if (cancelled) return;

      setSession(result);
      setIsLoading(false);

      if (!result) onUnauthenticated();
    });

    return () => {
      cancelled = true;
    };
    // onUnauthenticated suele ser una lambda nueva en cada render; sólo
    // interesa ejecutar esto al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { session, isLoading };
}
