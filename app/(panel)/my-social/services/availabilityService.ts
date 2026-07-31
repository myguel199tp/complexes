import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export interface AvailabilityResponse {
  /** Aforo total del espacio */
  capacity: number;
  /** Personas ya reservadas en la franja */
  occupied: number;
  available: number;
  /** Tope por apartamento; null = sin tope */
  apartmentLimit: number | null;
  apartment: string | null;
  apartmentOccupied: number;
  /** Cupos que le quedan al apartamento; null si no hay tope */
  apartmentAvailable: number | null;
}

/**
 * Cupos libres de una franja. Los calcula el backend porque el aforo depende
 * de cuántas personas trae cada reserva, no de cuántas reservas hay.
 */
export async function availabilityService(
  conjuntoId: string,
  activityId: string,
  date: string,
): Promise<AvailabilityResponse> {
  const params = new URLSearchParams({ activity: activityId, date });

  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/reservation-activity/availability?${params.toString()}`,
    {
      method: "GET",
      headers: {
        "x-conjunto-id": conjuntoId,
      },
    },
  );

  if (!response.ok) {
    throw new Error("No se pudo consultar la disponibilidad");
  }

  return await response.json();
}
