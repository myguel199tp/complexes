import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { route } from "@/app/_domain/constants/routes";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { HollidayPayService } from "@/app/(panel)/my-holliday/services/hollidayPayService";
import { RegisterOptionsHollidayPayRequest } from "@/app/(panel)/my-holliday/services/request/registerHollidayPayRequest";

export function useMutationPayHolliday() {
  const api = new HollidayPayService();
  const router = useRouter();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation({
    mutationFn: async (formData: RegisterOptionsHollidayPayRequest) => {
      const response = await api.registerPayment(formData);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData?.error ||
          errorData?.message ||
          "Ocurrió un error desconocido al registrar el holiday";
        throw new Error(errorMessage);
      }

      return response.json();
    },

    onSuccess: () => {
      showAlert("¡Operación exitosa!", "success");
      setTimeout(() => {
        router.push(route.vacations);
      }, 100);
    },

    onError: (error: any) => {
      // ✅ Mostramos el mensaje real que viene del backend
      showAlert(error.message || "¡Error en el servidor!", "error");
    },
  });
}
