"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type SessionClaims = {
  id: string;
  name: string;
  lastName: string;
  email: string;
  numberId: string;
  nit: string;
  file: string;
  roles: string[];
  conjuntos: { id: string; name: string }[];
  exp: number;
};

type SessionContextValue = {
  session: SessionClaims | null;
  /** false mientras se resuelve la primera carga desde /api/auth/session. */
  isLoading: boolean;
  reload: () => Promise<SessionClaims | null>;
  clear: () => void;
};

const SessionContext = createContext<SessionContextValue>({
  session: null,
  isLoading: true,
  reload: async () => null,
  clear: () => {},
});

export async function fetchSession(): Promise<SessionClaims | null> {
  try {
    const res = await fetch("/api/auth/session", {
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

export function SessionProvider({
  initialSession,
  children,
}: {
  initialSession: SessionClaims | null;
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<SessionClaims | null>(initialSession);
  // El layout raíz resuelve la sesión en el servidor, así que en la primera
  // pintura ya está disponible y no hay parpadeo de "sin sesión".
  const [isLoading, setIsLoading] = useState(initialSession === null);

  const reload = useCallback(async () => {
    const next = await fetchSession();
    setSession(next);
    setIsLoading(false);
    return next;
  }, []);

  const clear = useCallback(() => {
    setSession(null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Sólo se consulta si el servidor no entregó sesión: cubre el caso de
    // haber iniciado sesión en otra pestaña.
    if (initialSession === null) {
      void reload();
    }
  }, [initialSession, reload]);

  const value = useMemo(
    () => ({ session, isLoading, reload, clear }),
    [session, isLoading, reload, clear],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

/** Reemplaza a getTokenPayload(): mismos campos, sin leer ninguna cookie. */
export function useSession(): SessionContextValue {
  return useContext(SessionContext);
}

/** Atajo para los sitios que sólo querían el payload del token. */
export function useTokenPayload(): SessionClaims | null {
  return useContext(SessionContext).session;
}
