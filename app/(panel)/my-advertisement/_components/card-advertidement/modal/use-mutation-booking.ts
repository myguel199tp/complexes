"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { DataBookingServices } from "../../../services/bookingService";
import { ICreateBookingRequest } from "../../../services/request/orderRequest";

const api = new DataBookingServices();

/**
 * Solicita una cita de servicio.
 *
 * No navega al terminar: el vecino suele querer seguir mirando el marketplace,
 * y la confirmación llega después por notificación del vendedor. Invalida la
 * disponibilidad para que la franja recién tomada desaparezca al instante.
 */
export function useMutationBooking(onDone?: () => void) {
  const showAlert = useAlertStore((state) => state.showAlert);
  const queryClient = useQueryClient();
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useMutation({
    mutationFn: async (data: ICreateBookingRequest) => {
      if (!conjuntoId) {
        throw new Error("No hay un conjunto seleccionado");
      }

      return api.create(conjuntoId, data);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability"] });
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });

      showAlert(
        "¡Cita solicitada! Te avisamos cuando el vendedor la confirme.",
        "success",
      );

      onDone?.();
    },

    onError: (error: Error) => {
      showAlert(error.message || "No se pudo agendar la cita", "error");
    },
  });
}
