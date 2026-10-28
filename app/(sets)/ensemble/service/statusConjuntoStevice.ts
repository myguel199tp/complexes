import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { backendError } from "@/app/helpers/backendError";

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
    throw await backendError(response);
  }

  return response.json();
}
