import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { DataGuestAccessService } from "../services/guestAccessService";

const api = new DataGuestAccessService();

export function useRevokeGuestAccessMutation(externalListingId: string) {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation<unknown, Error, string>({
    mutationFn: (guestAccessId) => api.revoke(guestAccessId),
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
