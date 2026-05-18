import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export interface ExternalStayRequest {
  guestName: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
}

export interface ExternalStayResponse {
  id: string;
  guestName: string;
  startDate: string;
  endDate: string;
  totalAmount: number;

  platformFee: number;
  phFee: number;

  status: "PENDING" | "PAID";

  createdAt: string;
  updatedAt: string;

  externalListing: {
    id: string;
  };
}

export class DataExternalStayServices {
  async createStay(externalListingId: string, data: ExternalStayRequest) {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/external-stays/${externalListingId}`,
      {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Error creating stay");
    }

    return response.json();
  }

  async getStaysByListing(
    externalListingId: string,
  ): Promise<ExternalStayResponse[]> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/external-stays/listing/${externalListingId}`,
      {
        method: "GET",
      },
    );

    if (!response.ok) {
      throw new Error("Error fetching stays");
    }

    return response.json();
  }

  async markAsPaid(stayId: string) {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/external-stays/${stayId}/pay`,
      {
        method: "PATCH",
      },
    );

    if (!response.ok) {
      throw new Error("Error marking stay as paid");
    }

    return response.json();
  }
}
