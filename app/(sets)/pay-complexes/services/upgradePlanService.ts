import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export interface IUpgradePlan {
  plan: "gold" | "platinum";
}

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
      throw new Error("No se pudo calcular el costo del upgrade");
    }

    return response.json();
  }

  async upgradePlan(
    conjuntoId: string,
    data: IUpgradePlan,
  ): Promise<Response> {
    return fetchWithAuth(
      `${process.env.NEXT_PUBLIC_API_URL}/api/conjuntos/upgrade-plan`,
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
