import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { ConjuntoExternalStayResponse } from "./response/conjuntoExternalStaysResponse";

/**
 * Huéspedes externos del conjunto, para la administración. Sólo lo pueden
 * llamar EMPLOYEE y ADMONPLUS; el backend resuelve el conjunto con el header.
 */
export async function conjuntoExternalStaysService(
  conjuntoId: string,
): Promise<ConjuntoExternalStayResponse[]> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/external-stays/conjunto`,
    {
      method: "GET",
      headers: { "x-conjunto-id": conjuntoId },
    },
  );

  if (!response.ok) {
    throw new Error("Error fetching conjunto external stays");
  }

  return response.json();
}
