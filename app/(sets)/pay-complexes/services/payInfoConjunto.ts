import { payConjuntoResposne } from "./response/paycpnjuntoResponse";

export async function allPaymentService(
  conjuntoId: string,
): Promise<payConjuntoResposne> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/conjuntos/${conjuntoId}/payment-status`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: payConjuntoResposne = await response.json();
  return data;
}
