"use client";

import { useSession } from "@/app/components/session-provider";

/**
 * Antes decodificaba la cookie accessToken en el navegador. Ahora se apoya en
 * los claims verificados en el servidor: la cookie es httpOnly e ilegible.
 */
export function useAuth() {
  const { session } = useSession();

  if (!session?.exp) return false;

  return Date.now() < session.exp * 1000;
}
