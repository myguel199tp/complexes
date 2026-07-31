"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { availabilityService } from "../../services/availabilityService";

/**
 * Consulta los cupos de la franja elegida. Sin fecha no hay nada que
 * preguntar, así que la query queda deshabilitada.
 */
export function useAvailabilityQuery(activityId: string, date: string | null) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useQuery({
    queryKey: ["query_activity_availability", conjuntoId, activityId, date],
    queryFn: () => availabilityService(conjuntoId, activityId, date as string),
    enabled: !!conjuntoId && !!activityId && !!date,
    staleTime: 15_000,
  });
}
