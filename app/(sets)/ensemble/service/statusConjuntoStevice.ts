import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export type PaymentStatusResponse = {
  isActive: boolean;
  nextPaymentDate?: string;
  daysRemaining?: number;
};

export async function StatusService(
  conjuntoId: string,
): Promise<PaymentStatusResponse> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/conjuntos/payment-status`;

  const response = await fetchWithAuth(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  return response.json();
}
