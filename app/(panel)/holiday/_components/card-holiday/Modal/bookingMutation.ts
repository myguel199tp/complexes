import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";

import { CreateBookingRequest } from "../../../services/request/bookingRequest";
import { CreateBookingResponse } from "../../../services/response/bookingResponse";
import { createBookingService } from "../../../services/bookingService";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export function useBookingMutation() {
  const router = useRouter();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation<CreateBookingResponse, Error, CreateBookingRequest>({
    mutationFn: async (data) => {
      return await createBookingService(data, conjuntoId);
    },

    onSuccess: (data) => {
      showAlert("¡Operación exitosa!", "success");
      router.push(data?.redirectUrl);
    },

    // `createBookingService` lanza con el mensaje del backend, que dice por
    // qué no se pudo (noches tomadas o fuera de la ventana del anfitrión).
    onError: (error) => {
      showAlert(
        error.message || "Las fechas seleccionadas no están disponibles",
        "error",
      );
    },
  });
}
