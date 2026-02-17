import { parseCookies } from "nookies";

export interface ExternalStayRequest {
  guestName: string;
  startDate: string; // ISO string "2026-02-10"
  endDate: string; // ISO string
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
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/external-stays/${externalListingId}`,
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
      throw new Error("Error creating stay");
    }

    return response.json();
  }

  async getStaysByListing(
    externalListingId: string,
  ): Promise<ExternalStayResponse[]> {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/external-stays/listing/${externalListingId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Error fetching stays");
    }

    return response.json();
  }

  async markAsPaid(stayId: string) {
    const cookies = parseCookies();
    const token = cookies.accessToken;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/external-stays/${stayId}/pay`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Error marking stay as paid");
    }

    return response.json();
  }
}
