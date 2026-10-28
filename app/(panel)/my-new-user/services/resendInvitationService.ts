import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { backendError } from "@/app/helpers/backendError";

export interface ResendInvitationResponse {
  success: boolean;
  message: string;
  /** Correo enmascarado al que salió la invitación. */
  email?: string;
}

/**
 * Reenvía el correo de activación a un usuario del conjunto que todavía no
 * activa su cuenta. Va por el id de la relación (la fila de la tabla).
 */
export async function resendInvitationService(
  relationId: string,
  conjuntoId: string,
): Promise<ResendInvitationResponse> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/resend-invitation/${relationId}`,
    {
      method: "POST",
      headers: {
        "x-conjunto-id": conjuntoId,
      },
    },
  );

  if (!response.ok) {
    throw await backendError(response, "No se pudo reenviar la invitación");
  }

  return response.json();
}
