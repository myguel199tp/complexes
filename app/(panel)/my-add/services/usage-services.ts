import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export interface UsageResponse {
  currentCount: number;
  maxItems: number;
  remaining: number;
  canHighlight: boolean;
  active: boolean;
}

export class UsageServices {
  async getUsage(conjuntoId: string): Promise<UsageResponse> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/seller-profile/usage/me`,
      {
        headers: {
          "x-conjunto-id": conjuntoId,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Error obteniendo uso");
    }

    return response.json();
  }
}
