import {
  BookingCompletionSummary,
  BookingPaymentSync,
  ConfirmBookingPayload,
} from "./request/bokkingRequest";

/**
 * Al volver de Mercado Pago: el backend consulta el pago y, si quedó
 * aprobado, confirma la reserva sin esperar el aviso de Mercado Pago.
 */
export async function syncBookingPayment(
  token: string,
): Promise<BookingPaymentSync> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/booking/payment-sync`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    },
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "No pudimos consultar tu pago");
  }

  return result;
}

export async function confirmBooking(payload: ConfirmBookingPayload) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/booking/confirm`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Error confirmando la reserva");
  }

  return result;
}

/**
 * Lo que la página muestra de la reserva. Antes salía de decodificar el token,
 * que llevaba el documento, el correo y el teléfono del huésped legibles en la
 * URL; ahora el token solo trae el id y el resumen lo da el backend.
 */
export async function getCompletionSummary(
  token: string,
): Promise<BookingCompletionSummary> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/booking/complete/${encodeURIComponent(token)}`,
    { method: "GET", cache: "no-store" },
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "El enlace expiró o no es válido");
  }

  return result;
}
