import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { ContractResponse } from "./response/contractResponse";
import { backendMessage } from "@/app/helpers/backendError";

export async function getMyContractService(
  conjuntoId: string,
): Promise<ContractResponse> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/contracts/my-contract`,
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
