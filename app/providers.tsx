"use client";

import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState } from "react";
import { SessionRefresher } from "./components/session-refresher";
import { SessionProvider, type SessionClaims } from "./components/session-provider";

interface Props {
  children: React.ReactNode;
  session: SessionClaims | null;
}

export function Providers({ children, session }: Props) {
  const [queryClient] = useState(() => {
    /*
      Con `staleTime` de 5 minutos una lista no se vuelve a pedir mientras esté
      fresca, y la mayoría de mutaciones del panel no invalidaba su consulta:
      se creaba una actividad, se volvía al listado y seguía la versión en
      caché hasta recargar la página. En vez de perseguir la query key de cada
      una, cualquier mutación que termina bien marca todo como viejo: lo que
      está en pantalla se vuelve a pedir enseguida y el resto al montarse.

      No se devuelve la promesa a propósito: el MutationCache la esperaría y
      el `onSuccess` de cada pantalla (alerta, redirección) quedaría detrás de
      la recarga. Una mutación que no cambia datos (enviar un OTP, una vista
      previa) puede saltarse esto con `meta: { skipInvalidate: true }`.
    */
    const client: QueryClient = new QueryClient({
      mutationCache: new MutationCache({
        onSuccess: (_data, _variables, _context, mutation) => {
          if (mutation.meta?.skipInvalidate) return;
          void client.invalidateQueries();
        },
      }),
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000,
          cacheTime: 30 * 60 * 1000,
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
          retry: 1,
        },
      },
    });

    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider initialSession={session}>
        <SessionRefresher />
        {children}
      </SessionProvider>
    </QueryClientProvider>
  );
}
