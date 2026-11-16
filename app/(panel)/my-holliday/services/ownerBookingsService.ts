import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { OwnerBooking } from "./response/ownerBookingsResponse";
import { backendError } from "@/app/helpers/backendError";

const API = process.env.NEXT_PUBLIC_API_URL;

// Anfitrión: reservas de un inmueble suyo, próximas y pasadas
export async function ownerBookingsService(
  hollidayId: string,
): Promise<OwnerBooking[]> {
  const query = new URLSearchParams({ hollidayId });
  const response = await fetchWithAuth(
    `${API}/api/booking/owner/bookings?${query.toString()}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!response.ok) {
    throw await backendError(response);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

// El anfitrión cancela una reserva antes de la llegada (PATCH /api/booking/:id/cancel)
export async function ownerCancelBookingService(bookingId: string) {
  const response = await fetchWithAuth(
    `${API}/api/booking/${bookingId}/cancel`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.message || "No se pudo cancelar la reserva");
  }

  return response.json();
}

async function hostAction(bookingId: string, action: "arrived" | "no-show") {
  const response = await fetchWithAuth(
    `${API}/api/booking/${bookingId}/${action}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.message || "No se pudo actualizar la reserva");
  }

  return response.json();
}

// Anfitrión: el huésped llegó (fincas y casas sin portería)
export function markArrivedService(bookingId: string) {
  return hostAction(bookingId, "arrived");
}

// Anfitrión: el huésped no se presentó; se liberan las noches que quedaban
export function markNoShowService(bookingId: string) {
  return hostAction(bookingId, "no-show");
}

// Anfitrión: recibió el inmueble sin novedades; el depósito vuelve al huésped
export async function confirmHandoverService(bookingId: string) {
  const response = await fetchWithAuth(
    `${API}/api/booking/${bookingId}/handover`,
    { method: "PATCH", headers: { "Content-Type": "application/json" } },
  );

  if (!response.ok) {
    throw await backendError(response, "No se pudo registrar la entrega");
  }

  return response.json();
}

export interface DamageClaimPayload {
  bookingId: string;
  amount: number;
  description: string;
  photos: File[];
}

// Anfitrión: reporta daños contra el depósito (multipart, 1 a 6 fotos)
export async function createDamageClaimService({
  bookingId,
  amount,
  description,
  photos,
}: DamageClaimPayload) {
  const form = new FormData();
  form.append("amount", String(amount));
  form.append("description", description);
  photos.forEach((photo) => form.append("photos", photo));

  // Sin Content-Type: el navegador pone el boundary del multipart.
  const response = await fetchWithAuth(
    `${API}/api/booking/${bookingId}/damage-claim`,
    { method: "POST", body: form },
  );

  if (!response.ok) {
    throw await backendError(response, "No se pudo enviar el reporte de daños");
  }

  return response.json();
}
