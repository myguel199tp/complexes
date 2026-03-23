import { useMutation } from "@tanstack/react-query";
import { privewRequest } from "../../../services/request/privewRequest";
import { createPrivewtService } from "../../../services/privewService";
import { BookingPreviewResponse } from "../../../services/response/privewResponse";

export function useBookingPreview() {
  return useMutation<BookingPreviewResponse, Error, privewRequest>({
    mutationFn: (data) => createPrivewtService(data),
    onError: (error: Error) => {
      console.error("Error al obtener el preview de la reserva:", error);
    },
  });
}
