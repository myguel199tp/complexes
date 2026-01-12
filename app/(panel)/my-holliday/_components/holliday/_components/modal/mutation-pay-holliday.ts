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
      const result = await api.registerPayment(formData);

      if (!result.data) {
        throw new Error(
          result.message ||
            "Ocurrió un error desconocido al registrar el holiday"
        );
      }

      return result; // ← AQUÍ ESTÁ LA CORRECCIÓN
    },

    onSuccess: () => {
      showAlert("¡Operación exitosa!", "success");
      router.push(route.vacations);
    },

    onError: (error: any) => {
      showAlert(error.message || "¡Error en el servidor!", "error");
    },
  });
}
