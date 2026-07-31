"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { useAlertStore } from "@/app/components/store/useAlertStore";
import { route } from "@/app/_domain/constants/routes";

import { ConfirmBookingPayload } from "../service/request/bokkingRequest";
import { confirmBooking } from "../service/bookingService";

interface ConfirmBookingResponse {
  success: boolean;
  bookingId: string;
  status: string;
  accessCode?: string | null;
  /**
   * Rol temporal otorgado en el conjunto del inmueble. Llega en null cuando el
   * inmueble es externo (finca, casa independiente) y por tanto no pertenece a
   * ninguna comunidad.
   */
  accesoConjunto?: {
    rol: string;
    conjuntoId: string;
    desde: string;
    hasta: string;
  } | null;
  message: string;
}

export function useConfirmBooking() {
  const router = useRouter();

  const showAlert = useAlertStore((s) => s.showAlert);

  return useMutation<ConfirmBookingResponse, Error, ConfirmBookingPayload>({
    mutationFn: confirmBooking,

    onSuccess: (data) => {
      // Solo los inmuebles dentro de un conjunto registran al huésped en la
      // comunidad; en una finca o casa independiente no hay portería que avisar.
      const message = data.accesoConjunto
        ? "Reserva confirmada 🎉 Quedaste registrado como visitante del conjunto durante tu estancia."
        : data.message || "Reserva confirmada con éxito 🎉";

      showAlert(message, "success");

      router.push(route.myvacations);
    },

    onError: (error) => {
      showAlert(error.message || "Error confirmando la reserva", "error");
    },
  });
}
