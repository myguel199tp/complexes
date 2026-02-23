"use client";

import { useQuery } from "@tanstack/react-query";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { allHabeasService } from "../service/habeasService";

export function useHabeasQuery() {
  const payload = getTokenPayload();
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
