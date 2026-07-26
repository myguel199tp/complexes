"use client";

import { useEffect, useState } from "react";

export type ComercioSession = {
  id: string;
  email: string;
  exp: number;
};

/**
 * La cookie de comercio es httpOnly: el navegador ya no puede leerla. La
 * existencia de sesión se consulta al servidor, que valida la firma.
 */
export async function fetchComercioSession(): Promise<ComercioSession | null> {
  try {
    const res = await fetch("/api/comercio/session", {
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

export async function clearComercioToken(): Promise<void> {
  try {
    await fetch("/api/comercio/logout", {
      method: "POST",
      credentials: "same-origin",
    });
  } catch {
    // Si falla la red, la cookie caduca sola a las 24h.
  }
}

type GuardState = {
  /** null mientras se resuelve; luego la sesión o false si no hay. */
  session: ComercioSession | null;
  isLoading: boolean;
};

/**
 * Reemplaza al patrón `if (!getComercioToken()) router.push(...)` que había en
 * cada página. Redirige al login cuando el servidor dice que no hay sesión.
 */
export function useComercioGuard(
  onUnauthenticated: () => void,
): GuardState {
  const [session, setSession] = useState<ComercioSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchComercioSession().then((result) => {
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
