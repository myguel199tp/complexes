import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export interface ExternalStayRequest {
  conjuntoId: string;
  guestName: string;
  guestEmail: string;
  startDate: string;
  endDate: string;
  guestsCount: number;
}

export interface GuestAccessEmbedded {
  id: string;
  accessCode: string;
  validFrom: string;
  validTo: string;
}

export interface ExternalStayResponse {
  id: string;
  guestName: string;
  guestEmail: string;
  startDate: string;
  endDate: string;
  guestsCount: number;

  platformFee: number;
  phFee: number;

  status: "PENDING" | "PAID" | "CANCELLED";

  createdAt: string;
  updatedAt: string;

  externalListing: {
    id: string;
  };

  // No confirmado con backend si el create/list de stays devuelve el guestAccess embebido.
  guestAccess?: GuestAccessEmbedded;
}

export class DataExternalStayServices {
  async createStay(
    externalListingId: string,
    data: ExternalStayRequest,
  ): Promise<ExternalStayResponse> {
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

  async markAsPaid(stayId: string): Promise<ExternalStayResponse> {
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
