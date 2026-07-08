"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { conjuntoGuestsService } from "../../../services/conjuntoGuestsService";
import { ConjuntoGuestResponse } from "../../../services/response/conjuntoGuestsResponse";

export function useConjuntoGuestsQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useQuery<ConjuntoGuestResponse[]>({
    queryKey: ["conjunto-guests", conjuntoId],
    queryFn: () => conjuntoGuestsService(String(conjuntoId)),
    enabled: !!conjuntoId,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
