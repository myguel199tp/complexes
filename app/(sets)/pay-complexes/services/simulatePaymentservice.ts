import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export interface ISimulatePayment {
  amount: number;
  currency: string;
  plan: string;
  billingPeriod: "mensual" | "semestral" | "anual";
  /**
   * Inscripción del básico: "add" la suma al plan, "only" paga sólo ella.
   * Con `basicHistory` y `upgradeTo`, lo único del cobro que decide el cliente.
   */
  basicLicense?: "add" | "only";
  /** Pagar un año de historial completo del básico inscrito. */
  basicHistory?: boolean;
  /** Mejorar a este plan; cambia cuando el pago se confirma. */
  upgradeTo?: "gold" | "platinum";
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
