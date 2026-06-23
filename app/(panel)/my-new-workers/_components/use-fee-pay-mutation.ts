import { useMutation } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { approveAdminFeeService } from "../services/userPayFeeService";

export function useMutationFeePayUser() {
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation({
    mutationFn: (adminFeeId: string) =>
      approveAdminFeeService(adminFeeId, conjuntoId),
    onSuccess: () => {
      showAlert("✅ Pago aprobado exitosamente", "success");
    },
    onError: () => {
      showAlert("❌ Error al aprobar el pago", "error");
    },
  });
}
