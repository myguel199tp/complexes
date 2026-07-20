import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { MarkContactAttendedService } from "../../services/contactOwnerService";
import { ContactOwnerResponse } from "../../services/response/contactOwnerResponse";
import { QUERY_CONTACTS_BY_OWNER } from "./useQueryContacts";

export function useMutationAttended() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation<
    ContactOwnerResponse,
    Error,
    { id: string; attended: boolean }
  >({
    mutationFn: ({ id, attended }) => MarkContactAttendedService(id, attended),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_CONTACTS_BY_OWNER] });
    },

    onError: (error: Error) => {
      showAlert(error.message || "¡Error en el servidor!", "error");
    },
  });
}
