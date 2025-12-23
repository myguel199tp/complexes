// src/hooks/useInfoQuery.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { termsService } from "../services/termsServices";

export function useTermQuery() {
  const QUERY_TERMS = "query_terms";
  const query = useQuery({
    queryKey: [QUERY_TERMS],
    queryFn: () => termsService(),
  });

  return {
    ...query,
  };
}
