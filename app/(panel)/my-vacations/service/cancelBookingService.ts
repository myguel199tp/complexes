import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export interface CancelPreview {
  puedeCancelar: boolean;
  /** Por qué no, cuando no se puede. */
  motivo: string | null;
  cobrada: boolean;
  porcentajeReembolso: number;
  reembolso: number;
  moneda: string;
  politica: { codigo: string; nombre: string; descripcion: string };
  /** Lista para poner en la confirmación. */
  mensaje: string;
}

// Lo que pasaría si se cancela ahora (GET /api/booking/:id/cancel-preview)
export async function cancelPreviewService(
  bookingId: string,
): Promise<CancelPreview> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/booking/${bookingId}/cancel-preview`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "No se pudo consultar la cancelación");
  }

  return response.json();
}

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
