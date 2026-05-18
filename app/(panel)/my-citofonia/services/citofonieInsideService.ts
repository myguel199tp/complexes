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

  async getMyVisits(conjuntoId: string, id: string) {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

    const response = await fetchWithAuth(
      `${BASE_URL}/api/visit/my-visits/${id}`,
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
