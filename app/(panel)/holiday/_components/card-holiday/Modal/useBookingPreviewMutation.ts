import { useMutation } from "@tanstack/react-query";
import { privewRequest } from "../../../services/request/privewRequest";
import { createPrivewtService } from "../../../services/privewService";
import { BookingPreviewResponse } from "../../../services/response/privewResponse";
import { useAlertStore } from "@/app/components/store/useAlertStore";

export function useBookingPreview() {
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation<BookingPreviewResponse, Error, privewRequest>({
    mutationFn: (data) => createPrivewtService(data),
    onError: (error: Error) => {
      console.error("Error al obtener el preview de la reserva:", error);
      showAlert(
        error.message || "No se pudo calcular el valor de la reserva",
        "error",
      );
    },
  });
}
