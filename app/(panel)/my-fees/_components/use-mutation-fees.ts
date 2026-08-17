import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { FeePaymentsService } from "../services/feePaymentsService";
import {
  AdminFeePayment,
  CreateAdminFeePaymentDto,
} from "../services/admin-fee-payment";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";

/**
 * Guarda la configuración de cobro.
 *
 * Con `configId` corrige la existente; sin él la crea. Antes solo existía el
 * alta: no había PATCH en el backend, así que cambiar un monto obligaba a
 * volver a guardar y eso insertaba otra fila, dejando la anterior conviviendo
 * con la nueva.
 */
export function useAdminFeePaymentMutation(configId?: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation<AdminFeePayment, Error, CreateAdminFeePaymentDto>({
    mutationFn: (data) =>
      configId
        ? FeePaymentsService.updatePayment(configId, data, conjuntoId)
        : FeePaymentsService.createPayment(data, conjuntoId),

    onSuccess: () => {
      showAlert("¡Configuración guardada correctamente!", "success");

      queryClient.invalidateQueries({ queryKey: ["fee_payments"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-fee-payments"],
      });

      router.push(route.myfees);
    },

    onError: (error) => {
      showAlert(error.message || "Error al guardar", "error");
    },
  });
}
