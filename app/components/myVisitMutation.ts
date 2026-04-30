import { useMutation } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useQueryClient } from "@tanstack/react-query";
import { CitofonieService } from "../(panel)/my-citofonia/services/citofonieService";

const api = new CitofonieService();
export function useMutationUploadPayment() {
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ visitId, file }: { visitId: string; file: File }) => {
      return api.uploadPayment(conjuntoId, visitId, file);
    },

    onSuccess: () => {
      showAlert("¡Comprobante subido correctamente!", "success");

      queryClient.invalidateQueries({ queryKey: ["visits"] });
    },

    onError: () => {
      showAlert("Error subiendo comprobante", "error");
    },
  });
}
