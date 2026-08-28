"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { conjuntoExternalStaysService } from "../services/conjuntoExternalStaysService";
import { ConjuntoExternalStayResponse } from "../services/response/conjuntoExternalStaysResponse";

export function useConjuntoExternalStaysQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useQuery<ConjuntoExternalStayResponse[]>({
    queryKey: ["conjunto-external-stays", conjuntoId],
    queryFn: () => conjuntoExternalStaysService(String(conjuntoId)),
    enabled: !!conjuntoId,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
