import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { payConjuntoResposne } from "./response/paycpnjuntoResponse";
import { backendError } from "@/app/helpers/backendError";

export async function allPaymentService(
  conjuntoId: string,
): Promise<payConjuntoResposne> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/conjuntos/payment-status`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
    },
  );

  if (!response.ok) {
    throw await backendError(response);
  }

  const data: payConjuntoResposne = await response.json();
  return data;
}
