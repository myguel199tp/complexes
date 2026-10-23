import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export interface ISimulatePayment {
  amount: number;
  currency: string;
  plan: string;
  billingPeriod: "mensual" | "semestral" | "anual";
  /**
   * Licencia del básico de por vida: "add" la suma al plan, "only" paga sólo
   * ella. Es lo único del cobro que decide el cliente.
   */
  basicLicense?: "add" | "only";
  /** Pagar un año de historial completo del básico de por vida. */
  basicHistory?: boolean;
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
