import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { backendError } from "@/app/helpers/backendError";

/** Desglose del upgrade: qué se abona del plan actual y qué queda por pagar. */
export interface IUpgradeQuote {
  plan: string;
  currentPlan: string;
  billingPeriod: string;
  currency?: string;
  /** Precio de lista del plan nuevo por el periodo completo. */
  newAmount: number;
  /** Abono por el tiempo del plan actual que aún no se consume. */
  creditAmount: number;
  /** Parte del depósito del básico gratis que se abona a la mejora. */
  depositCreditAmount?: number;
  /** Lo que hay que pagar hoy. */
  chargedAmount: number;
  unusedDays: number;
  periodDays: number;
}

export class UpgradePlanService {
  async previewUpgrade(
    conjuntoId: string,
    plan: string,
  ): Promise<IUpgradeQuote> {
    const response = await fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/conjuntos/upgrade-plan/preview?plan=${plan}`,
      {
        method: "GET",
        headers: { "x-conjunto-id": conjuntoId },
        credentials: "include",
      },
    );

    if (!response.ok) {
      throw await backendError(response, "No se pudo calcular el costo del upgrade");
    }

    return response.json();
  }
}
