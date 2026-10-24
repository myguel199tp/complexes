import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export interface ResumeBookingResponse {
  token: string;
  redirectUrl: string;
  bookingId: string;
  venceEl: string;
}

// Nuevo enlace para confirmar una reserva pendiente (POST /api/booking/:id/resume)
export async function resumeBookingService(
  bookingId: string,
): Promise<ResumeBookingResponse> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/booking/${bookingId}/resume`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "No se pudo retomar la reserva");
  }

  return response.json();
}
