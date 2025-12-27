// hooks/useBookingPreview.ts
import { useMutation } from "@tanstack/react-query";
import { privewRequest } from "../../../services/request/privewRequest";
import { createPrivewtService } from "../../../services/privewService";

export function useBookingPreview() {
  return useMutation({
    mutationFn: (data: privewRequest) => createPrivewtService(data),
    onError: (error: any) => {
      console.error("Error al obtener el preview de la reserva:", error);
    },
  });
}
