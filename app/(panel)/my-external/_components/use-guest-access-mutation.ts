import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { DataGuestAccessService } from "../services/guestAccessService";

const api = new DataGuestAccessService();

export function useRevokeGuestAccessMutation(externalListingId: string) {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useMutation<unknown, Error, string>({
    mutationFn: (guestAccessId) =>
      api.revoke(guestAccessId, String(conjuntoId)),
    onSuccess: () => {
      showAlert("Acceso revocado", "success");
      queryClient.invalidateQueries({
        queryKey: ["external-stays", externalListingId],
      });
    },
    onError: (error) => {
      showAlert(error.message || "Error revocando el acceso", "error");
    },
  });
}
