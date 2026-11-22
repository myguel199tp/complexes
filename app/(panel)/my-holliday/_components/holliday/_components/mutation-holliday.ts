import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { route } from "@/app/_domain/constants/routes";
import { DataHolidayServices } from "../../../services/hollidaServices";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { VideoPaymentRequired } from "../../../services/listingVideoService";

export function useMutationHolliday() {
  const api = new DataHolidayServices();
  const router = useRouter();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation<unknown, Error, FormData>({
    mutationFn: async (formData: FormData) => {
      const response = await api.addHolliday(conjuntoId, formData);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // El video subido se paga en Básico y Oro: el formulario muestra el
        // precio y reenvía con la confirmación.
        if (response.status === 402 && errorData?.code === "VIDEO_PAYMENT_REQUIRED") {
          throw new VideoPaymentRequired(errorData.message, errorData.video);
        }

        // El controlador manda la excepción entera en `error`, no solo el texto.
        const errorMessage =
          (typeof errorData?.error === "string"
            ? errorData.error
            : errorData?.error?.message) ||
          errorData?.message ||
          "Ocurrió un error desconocido al registrar el holiday";
        throw new Error(errorMessage);
      }

      return response.json();
    },

    onSuccess: () => {
      showAlert("¡Operación exitosa!", "success");
      router.push(route.vacations);
    },

    onError: (error: Error) => {
      // El cobro del video no es un error: lo pide el formulario.
      if (error instanceof VideoPaymentRequired) return;
      showAlert(error.message || "¡Error en el servidor!", "error");
    },
  });
}
