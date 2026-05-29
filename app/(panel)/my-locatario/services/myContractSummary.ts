import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { ContractSummaryResponse } from "./response/contractSummaryResponse";

export async function getMyContractSummaryService(
  conjuntoId: string,
): Promise<ContractSummaryResponse> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/contracts/my-summary`,
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
