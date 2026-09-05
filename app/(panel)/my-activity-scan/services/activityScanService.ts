import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

/** Lo que devuelve el backend al validar el QR de una reserva. */
export interface ValidatedReservationResponse {
  allowed: true;
  reservationId: string;
  code: string;
  activity: string;
  inChargue: string | null;
  reservationDate: string;
  durationMinutes: number;
  holder: { id: string; name: string } | null;
  apartment: string | null;
  adultsCount: number;
  minorsCount: number;
  people: number;
  /** Las notas que dejó el residente al reservar. */
  suggestions: string | null;
  price: number | null;
  checkedInAt: string;
}

/** Una reserva de la agenda del encargado. */
export interface AssignedReservationResponse {
  id: string;
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
  holderName: string | null;
  holderLastName: string | null;
}

/**
 * El backend explica el motivo del rechazo —fuera de horario, ya registrada, no
 * eres el encargado— y ese texto es exactamente lo que debe leer el
 * colaborador, así que se propaga tal cual.
 */
async function messageFrom(response: Response, fallback: string) {
  const text = await response.text();

  try {
    const parsed = text ? JSON.parse(text) : null;

    if (typeof parsed?.message === "string") return parsed.message;
    if (Array.isArray(parsed?.message)) return parsed.message.join(", ");
  } catch {
    if (text) return text;
  }

  return fallback;
}

export async function validateReservationService(
  code: string,
  conjuntoId: string,
): Promise<ValidatedReservationResponse> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/reservation-activity/validate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
      body: JSON.stringify({ code }),
    },
  );

  if (!response.ok) {
    throw new Error(await messageFrom(response, "No se pudo validar el código"));
  }

  return await response.json();
}

export async function assignedReservationsService(
  conjuntoId: string,
  date?: string,
): Promise<AssignedReservationResponse[]> {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";

  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/reservation-activity/assigned${query}`,
    {
      method: "GET",
      headers: { "x-conjunto-id": conjuntoId },
    },
  );

  if (!response.ok) {
    throw new Error(await messageFrom(response, "No se pudo cargar la agenda"));
  }

  return await response.json();
}
