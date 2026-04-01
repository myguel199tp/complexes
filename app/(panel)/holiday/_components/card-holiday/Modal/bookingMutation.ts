import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useAlertStore } from "@/app/components/store/useAlertStore";

import { CreateBookingRequest } from "../../../services/request/bookingRequest";
import { CreateBookingResponse } from "../../../services/response/bookingResponse";
import { createBookingService } from "../../../services/bookingService";

interface BackendErrorResponse {
  status: number;
  error: {
    response: string;
    status: number;
    message: string;
    name: string;
  };
}

export function useBookingMutation() {
  const router = useRouter();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation<
    CreateBookingResponse,
    AxiosError<BackendErrorResponse>,
    CreateBookingRequest
  >({
    mutationFn: async (data) => {
      return await createBookingService(data);
    },

    onSuccess: (data) => {
      showAlert("¡Operación exitosa!", "success");
      router.push(data?.redirectUrl);
    },

    onError: (error) => {
      const message =
        error.response?.data?.error?.message ??
        "Las fechas seleccionadas no están disponibles";

      showAlert(message, "error");
    },
  });
}
