import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export class CitofonieInsideService {
  async getVisitsInside(conjuntoId: string) {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

    const response = await fetchWithAuth(`${BASE_URL}/api/visit/inside`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al obtener visitas dentro");
    }

    return response.json();
  }

  /**
   * El id del usuario ya no viaja en la ruta: el backend lo toma del token.
   * Antes bastaba cambiar el parámetro para leer las visitas de otro residente.
   */
  async getMyVisits(conjuntoId: string) {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

    const response = await fetchWithAuth(
      `${BASE_URL}/api/visit/my-visits`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-conjunto-id": conjuntoId,
        },
      },
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Error al obtener mis visitas");
    }

    return response.json();
  }
}
