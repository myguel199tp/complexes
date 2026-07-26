"use client";

import { useQuery } from "@tanstack/react-query";
import { useTokenPayload } from "@/app/components/session-provider";
import { allHabeasService } from "../service/habeasService";

export function useHabeasQuery() {
  const payload = useTokenPayload();
  const numberId = typeof window !== "undefined" ? payload?.numberId : null;

  const QUERY_HABEAS = "query_habeas";

  const query = useQuery({
    queryKey: [QUERY_HABEAS, numberId],
    queryFn: () => allHabeasService(String(numberId)),
  });

  return {
    ...query,
    numberId,
  };
}
