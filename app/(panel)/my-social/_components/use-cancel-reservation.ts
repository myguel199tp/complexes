"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { cancelReservationService } from "../services/myReservationsService";

/** Cancela una reserva propia y refresca lo que depende de ella. */
export function useCancelReservation(onDone?: () => void) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const showAlert = useAlertStore((state) => state.showAlert);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reservationId: string) =>
      cancelReservationService(reservationId, conjuntoId),
    onSuccess: () => {
      showAlert("Reserva cancelada", "success");
      queryClient.invalidateQueries({
        queryKey: ["my_activity_reservations"],
      });
      // Los cupos de la franja quedaron libres
      queryClient.invalidateQueries({
        queryKey: ["query_activity_availability"],
      });
      onDone?.();
    },
    onError: (error: Error) => {
      showAlert(error.message || "No se pudo cancelar la reserva", "error");
    },
  });
}
