import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

// Cancelar una reserva (PATCH /api/booking/:id/cancel)
export async function cancelBookingService(bookingId: string) {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/booking/${bookingId}/cancel`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "No se pudo cancelar la reserva");
  }

  return response.json();
}
