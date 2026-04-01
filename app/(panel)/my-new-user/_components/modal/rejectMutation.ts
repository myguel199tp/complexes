import { useMutation } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { VerificationService } from "../../services/verificationService";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export function useMutationRejectPayment() {
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return VerificationService.rejectPayment(id, reason, conjuntoId);
    },

    onSuccess: () => {
      showAlert("Pago rechazado correctamente", "success");
    },

    onError: () => {
      showAlert("Error al rechazar", "error");
    },
  });
}
