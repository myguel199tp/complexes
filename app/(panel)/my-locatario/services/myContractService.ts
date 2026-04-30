import { ContractResponse } from "./response/contractResponse";

export async function getMyContractService(
  conjuntoId: string,
): Promise<ContractResponse> {
  const response = await fetch(
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
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  return await response.json();
}
