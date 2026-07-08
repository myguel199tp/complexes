import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { GuestResponse } from "./response/ownerGuestsResponse";

// Anfitrión: huéspedes actualmente dentro del holiday (hoy en rango)
export async function ownerGuestsService(
  hollidayId: string,
): Promise<GuestResponse[]> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/booking/owner/${hollidayId}/guests`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  return response.json();
}
