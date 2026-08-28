import { ExternalRequest } from "./request/externaRequest";
import { ExternalResponse } from "./response/externalResponse";
import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

/**
 * Todas las rutas de este módulo pasan por `JwtAuthGuard`, que exige el header
 * `x-conjunto-id` y responde 403 "Debes seleccionar un conjunto" si falta. El
 * conjunto viaja además en el cuerpo al crear, pero el guard se resuelve antes
 * de mirar el body, así que el header es obligatorio en las tres llamadas.
 */
export class DataExternalServices {
  async addExternal(
    hollidayId: string,
    data: ExternalRequest,
  ): Promise<ExternalResponse> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/external-listings/${hollidayId}`,
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
          "x-conjunto-id": data.conjuntoId,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Error creating external listing");
    }

    return response.json();
  }

  async getByHolliday(
    hollidayId: string,
    conjuntoId: string,
  ): Promise<ExternalResponse[]> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/external-listings/holliday/${hollidayId}`,
      {
        method: "GET",
        headers: {
          "x-conjunto-id": conjuntoId,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Error fetching external listings");
    }

    return response.json();
  }

  async deactivateExternal(
    id: string,
    conjuntoId: string,
  ): Promise<ExternalResponse> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/external-listings/${id}/deactivate`,
      {
        method: "PATCH",
        headers: {
          "x-conjunto-id": conjuntoId,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Error deactivating listing");
    }

    return response.json();
  }
}
