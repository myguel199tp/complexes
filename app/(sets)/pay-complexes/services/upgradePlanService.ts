import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export interface IUpgradePlan {
  plan: "gold" | "platinum";
}

export class UpgradePlanService {
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
