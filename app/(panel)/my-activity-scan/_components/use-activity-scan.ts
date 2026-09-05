"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  assignedReservationsService,
  validateReservationService,
} from "../services/activityScanService";

const ASSIGNED_KEY = "assigned_activity_reservations";

/** La agenda del día del encargado. */
export function useAssignedReservations(date?: string) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useQuery({
    queryKey: [ASSIGNED_KEY, conjuntoId, date ?? "hoy"],
    queryFn: () => assignedReservationsService(conjuntoId as string, date),
    enabled: !!conjuntoId,
  });
}

export function useValidateReservation(date?: string) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) =>
      validateReservationService(code, conjuntoId),
    // Validar marca la reserva como usada: la agenda que quedó en pantalla ya
    // no refleja el estado real.
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ASSIGNED_KEY, conjuntoId, date ?? "hoy"],
      });
    },
  });
}
