"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { SessionRefresher } from "./components/session-refresher";
import { SessionProvider, type SessionClaims } from "./components/session-provider";

interface Props {
  children: React.ReactNode;
  session: SessionClaims | null;
}

export function Providers({ children, session }: Props) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            cacheTime: 30 * 60 * 1000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider initialSession={session}>
        <SessionRefresher />
        {children}
      </SessionProvider>
    </QueryClientProvider>
  );
}
