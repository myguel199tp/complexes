import { ExternalRequest } from "./request/externaRequest";
import { ExternalResponse } from "./response/externalResponse";
import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

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
        },
      },
    );

    if (!response.ok) {
      throw new Error("Error creating external listing");
    }

    return response.json();
  }

  async getByHolliday(hollidayId: string): Promise<ExternalResponse[]> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/external-listings/holliday/${hollidayId}`,
      {
        method: "GET",
      },
    );

    if (!response.ok) {
      throw new Error("Error fetching external listings");
    }

    return response.json();
  }

  async deactivateExternal(id: string): Promise<ExternalResponse> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/external-listings/${id}/deactivate`,
      {
        method: "PATCH",
      },
    );

    if (!response.ok) {
      throw new Error("Error deactivating listing");
    }

    return response.json();
  }
}
