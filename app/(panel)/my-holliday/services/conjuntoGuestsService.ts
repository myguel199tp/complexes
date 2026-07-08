import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { ConjuntoGuestResponse } from "./response/conjuntoGuestsResponse";

// Empleado/Admin: huéspedes actualmente dentro del conjunto por holidays activos
export async function conjuntoGuestsService(
  conjuntoId: string,
): Promise<ConjuntoGuestResponse[]> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/booking/conjunto/guests`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  return response.json();
}
