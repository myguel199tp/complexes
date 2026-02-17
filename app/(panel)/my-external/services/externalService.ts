import { parseCookies } from "nookies";
import { ExternalRequest } from "./request/externaRequest";
import { ExternalResponse } from "./response/externalResponse";

export class DataExternalServices {
  // 🔹 Crear integración externa
  async addExternal(
    hollidayId: string,
    data: ExternalRequest,
  ): Promise<ExternalResponse> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/external-listings/${hollidayId}`,
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Error creating external listing");
    }

    return response.json();
  }

  // 🔹 Obtener integraciones por holliday
  async getByHolliday(hollidayId: string): Promise<ExternalResponse[]> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/external-listings/holliday/${hollidayId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Error fetching external listings");
    }

    return response.json();
  }

  // 🔹 Desactivar integración
  async deactivateExternal(id: string): Promise<ExternalResponse> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/external-listings/${id}/deactivate`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Error deactivating listing");
    }

    return response.json();
  }
}
