import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { createBookingService } from "../../../services/bookingService";
import { CreateBookingRequest } from "../../../services/request/bookingRequest";
import { CreateBookingResponse } from "../../../services/response/bookingResponse";

export function useBookingMutation() {
  const router = useRouter();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation<CreateBookingResponse, Error, CreateBookingRequest>({
    mutationFn: (data) => createBookingService(data),

    onSuccess: (data) => {
      showAlert("¡Operación exitosa!", "success");

      // ✅ REDIRECT USANDO EL BACKEND
      router.push(data.redirectUrl);
    },

    onError: (error) => {
      showAlert(error.message || "¡Error en el servidor!", "error");
    },
  });
}
