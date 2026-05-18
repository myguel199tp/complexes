import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export interface ISimulatePayment {
  amount: number;
  currency: string;
  plan: string;
  billingPeriod: "mensual" | "semestral" | "anual";
}

export class SimulatePaymentService {
  async simulatePayment(
    conjuntoId: string,
    data: ISimulatePayment,
  ): Promise<Response> {
    return fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/conjuntos/simulate-payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-conjunto-id": conjuntoId,
        },
        credentials: "include",
        body: JSON.stringify(data),
      },
    );
  }
}
