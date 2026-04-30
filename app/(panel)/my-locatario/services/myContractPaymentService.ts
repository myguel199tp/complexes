import { ContractPaymentResponse } from "./response/contractPaymentResponse";

export async function getMyContractPymentService(
  conjuntoId: string,
): Promise<ContractPaymentResponse[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/contracts/my-payments`,
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

  const data = await response.json();

  // 🔥 NORMALIZAR RESPUESTA
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.payments)) return data.payments;
  if (Array.isArray(data?.data)) return data.data;

  return []; // fallback seguro
}
