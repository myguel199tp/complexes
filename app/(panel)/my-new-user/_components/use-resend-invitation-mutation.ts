import { useMutation } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { resendInvitationService } from "../services/resendInvitationService";

export function useResendInvitationMutation(conjuntoId: string) {
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation({
    mutationFn: (relationId: string) =>
      resendInvitationService(relationId, conjuntoId),
    // Solo manda un correo: no hay datos que recargar.
    meta: { skipInvalidate: true },
    onSuccess: (response) => {
      showAlert(
        `Invitación reenviada${response.email ? ` a ${response.email}` : ""}. El enlace vence en 30 minutos.`,
        "success",
      );
    },
    onError: (error: Error) => {
      showAlert(error.message || "No se pudo reenviar la invitación", "error");
    },
  });
}
