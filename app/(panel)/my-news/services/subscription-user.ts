import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { SellerResponse } from "./response/sellerResponse";

export async function getSellerAccess(
  conjuntoId: string,
  moduleName: string,
): Promise<SellerResponse> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/subscription-access/${moduleName}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
      credentials: "include",
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  return await response.json();
}
