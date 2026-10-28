import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { TenantResponse } from "./response/tenanantResponse";
import { backendMessage } from "@/app/helpers/backendError";

export async function getMyTenantService(
  conjuntoId: string,
): Promise<TenantResponse> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/my-tenant`,
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
    throw new Error(backendMessage(errorText));
  }

  return await response.json();
}
