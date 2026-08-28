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

  // El backend embebe el guestAccess tanto en el create como en el list de stays.
  guestAccess?: GuestAccessEmbedded | null;
}


/**
 * Fila del listado consolidado (`GET /external-stays/mine`). A diferencia del
 * listado por plataforma, aquí cada estadía viene con la unidad y la plataforma
 * a la que pertenece, porque la tabla mezcla varias.
 */
export interface OwnerExternalStayResponse extends ExternalStayResponse {
  externalListing: {
    id: string;
    platform: string;
    listingUrl: string;
  };
  holliday: {
    id: string;
    codigo: string;
    name: string;
    property: string;
  };
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
          "x-conjunto-id": data.conjuntoId,
        },
      },
    );

    if (!response.ok) {
      // El backend explica por qué: fechas ocupadas por otro huésped, salida
      // anterior a la entrada... Un "Error creating stay" genérico obligaba al
      // propietario a adivinar qué corregir.
      const body = await response.json().catch(() => null);
      throw new Error(body?.message || "Error creating stay");
    }

    return response.json();
  }

  async getStaysByListing(
    externalListingId: string,
    conjuntoId: string,
  ): Promise<ExternalStayResponse[]> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/external-stays/listing/${externalListingId}`,
      {
        method: "GET",
        headers: { "x-conjunto-id": conjuntoId },
      },
    );

    if (!response.ok) {
      throw new Error("Error fetching stays");
    }

    return response.json();
  }


  async getMyStays(conjuntoId: string): Promise<OwnerExternalStayResponse[]> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/external-stays/mine`,
      {
        method: "GET",
        headers: { "x-conjunto-id": conjuntoId },
      },
    );

    if (!response.ok) {
      throw new Error("Error fetching external stays");
    }

    return response.json();
  }

  async markAsPaid(
    stayId: string,
    conjuntoId: string,
  ): Promise<ExternalStayResponse> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/external-stays/${stayId}/pay`,
      {
        method: "PATCH",
        headers: { "x-conjunto-id": conjuntoId },
      },
    );

    if (!response.ok) {
      throw new Error("Error marking stay as paid");
    }

    return response.json();
  }
}
