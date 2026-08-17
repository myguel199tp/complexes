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

/**
 * Aprueba registrando el monto que de verdad entró.
 *
 * El residente reporta lo que cree haber consignado y no siempre coincide con
 * el extracto. Antes ese paso no existía: la cuota se marcaba pagada por el
 * total, así que un abono parcial la saldaba completa.
 */
export function useMutationApproveAmount() {
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation({
    mutationFn: ({ id, amount }: { id: string; amount: number }) =>
      VerificationService.approvePaymentWithAmount(id, conjuntoId, amount),

    onSuccess: (fee: { status?: string }) => {
      showAlert(
        fee?.status === "PARTIAL"
          ? "Abono registrado. La cuota queda con saldo pendiente."
          : "Pago aprobado correctamente",
        "success",
      );
    },

    onError: (error: Error) => {
      showAlert(error.message || "Error al aprobar", "error");
    },
  });
}
