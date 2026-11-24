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
      // La vigencia la dice el backend: decía "30 minutos" fijo y el reenvío
      // de la administración ahora dura 7 días.
      showAlert(
        `Invitación reenviada${response.email ? ` a ${response.email}` : ""}.` +
          (response.expiresLabel
            ? ` El enlace vence en ${response.expiresLabel}.`
            : ""),
        "success",
      );
    },
    onError: (error: Error) => {
      showAlert(error.message || "No se pudo reenviar la invitación", "error");
    },
  });
}
