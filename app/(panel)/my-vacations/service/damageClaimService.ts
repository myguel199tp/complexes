import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { backendError } from "@/app/helpers/backendError";

// Huésped: su versión sobre los daños que reportó el anfitrión
// (PATCH /api/booking/:id/damage-claim/response)
export async function respondDamageClaimService({
  bookingId,
  response,
}: {
  bookingId: string;
  response: string;
}) {
  const res = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/booking/${bookingId}/damage-claim/response`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response }),
    },
  );

  if (!res.ok) {
    throw await backendError(res, "No se pudo enviar tu versión");
  }

  return res.json();
}
