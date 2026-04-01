import { useMutation } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { VerificationService } from "../../services/verificationService";

export function useMutationApprovePayment() {
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation({
    mutationFn: async (id: string) => {
      return VerificationService.approvePayment(id, conjuntoId);
    },

    onSuccess: () => {
      showAlert("Pago aprobado correctamente", "success");
    },

    onError: () => {
      showAlert("Error al aprobar", "error");
    },
  });
}
