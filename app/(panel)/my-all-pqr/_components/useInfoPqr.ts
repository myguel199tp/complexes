"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { t } from "i18next";
import { AllPqrService } from "../services/pqrAllServices";
import { AllPqrResponse } from "../services/response/AllPqrResponse";

export function useInfoPqrQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const QUERY_PQR = "query_pqr";

  const query = useQuery<AllPqrResponse[]>({
    queryKey: [QUERY_PQR, conjuntoId],
    queryFn: () => AllPqrService(String(conjuntoId)),
    enabled: !!conjuntoId,
  });

  return {
    ...query,
    data: query.data ?? [],
    error: query.error instanceof Error ? query.error.message : null,
    conjuntoId,
    BASE_URL,
    t,
  };
}
