import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAlertStore } from "@/app/components/store/useAlertStore";

import { route } from "@/app/_domain/constants/routes";
import {
  ISimulatePayment,
  SimulatePaymentService,
} from "../services/simulatePaymentservice";

export function useSimulatePayment(conjuntoId: string) {
  const api = new SimulatePaymentService();
  const showAlert = useAlertStore((state) => state.showAlert);
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: ISimulatePayment) => {
      const response = await api.simulatePayment(conjuntoId, data);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || "Error al simular el pago");
      }

      return response.json();
    },

    onSuccess: () => {
      showAlert("¡Conjunto activado correctamente!", "success");
      router.push(route.myprofile);
    },

    onError: (error: any) => {
      showAlert(error.message || "Error en el servidor", "error");
    },
  });
}
