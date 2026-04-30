import { useMutation } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useQueryClient } from "@tanstack/react-query";
import { CitofonieService } from "../../services/citofonieService";

const api = new CitofonieService();

export function useMutationVerifyPayment() {
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      visitId,
      action,
    }: {
      visitId: string;
      action: "approve" | "reject";
    }) => {
      if (action === "approve") {
        return api.approvePayment(conjuntoId, visitId);
      }

      return api.rejectPayment(conjuntoId, visitId);
    },

    onSuccess: (_, variables) => {
      if (variables.action === "approve") {
        showAlert("Pago aprobado correctamente", "success");
      } else {
        showAlert("Pago rechazado", "success");
      }

      queryClient.invalidateQueries({ queryKey: ["visits"] });
    },

    onError: () => {
      showAlert("Error verificando el pago", "error");
    },
  });
}
