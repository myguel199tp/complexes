import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { payConjuntoResposne } from "./response/paycpnjuntoResponse";

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
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: payConjuntoResposne = await response.json();
  return data;
}
