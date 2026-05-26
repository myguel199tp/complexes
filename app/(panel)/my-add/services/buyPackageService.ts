import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export interface BuyPackageRequest {
  packageId: string;
}
export interface UserSubscriptionResponse {
  id: string;
  userId: string;
  conjuntoId: string;
  packageId: string;
  startDate: string;
  endDate: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
export class DataBuyServices {
  async buyPackage(
    conjuntoId: string,
    data: BuyPackageRequest,
  ): Promise<UserSubscriptionResponse> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/subscriptions/buy`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-conjunto-id": conjuntoId,
        },
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      throw new Error("Error comprando paquete");
    }

    return response.json();
  }
}
