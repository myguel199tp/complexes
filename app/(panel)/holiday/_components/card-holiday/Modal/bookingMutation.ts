import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useAlertStore } from "@/app/components/store/useAlertStore";

import { CreateBookingRequest } from "../../../services/request/bookingRequest";
import { CreateBookingResponse } from "../../../services/response/bookingResponse";
import { createBookingService } from "../../../services/bookingService";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

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
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation<
    CreateBookingResponse,
    AxiosError<BackendErrorResponse>,
    CreateBookingRequest
  >({
    mutationFn: async (data) => {
      return await createBookingService(data, conjuntoId);
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
