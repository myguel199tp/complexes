import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

/** Una reserva mía, con el código que respalda su QR. */
export interface MyReservationResponse {
  id: string;
  /** `null` en las reservas anteriores al QR. */
  code: string | null;
  status: "ACTIVE" | "USED";
  reservation_date: string;
  apartment: string | null;
  adultsCount: number;
  minorsCount: number;
  description: string | null;
  checkedInAt: string | null;
  activityId: string;
  activityName: string;
  duration: number | null;
  inChargue: string | null;
}

export async function myReservationsService(
  conjuntoId: string,
): Promise<MyReservationResponse[]> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/reservation-activity/mine`,
    {
      method: "GET",
      headers: { "x-conjunto-id": conjuntoId },
    },
  );

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * El QR llega como PNG y la ruta pide el header `x-conjunto-id`, que un `<img
 * src>` no puede enviar. Por eso se descarga como blob y se muestra desde una
 * URL de objeto; quien la use debe revocarla al desmontar.
 */
export async function reservationQrObjectUrl(
  reservationId: string,
  conjuntoId: string,
): Promise<string> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/reservation-activity/${reservationId}/qr`,
    {
      method: "GET",
      headers: { "x-conjunto-id": conjuntoId },
    },
  );

  if (!response.ok) {
    const text = await response.text();

    let message = "No se pudo generar el código QR";

    try {
      const parsed = text ? JSON.parse(text) : null;
      if (typeof parsed?.message === "string") message = parsed.message;
    } catch {
      if (text) message = text;
    }

    throw new Error(message);
  }

  return URL.createObjectURL(await response.blob());
}
