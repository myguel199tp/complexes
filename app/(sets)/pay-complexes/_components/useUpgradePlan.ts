import { useQuery } from "@tanstack/react-query";
import {
  IUpgradeQuote,
  UpgradePlanService,
} from "../services/upgradePlanService";

/**
 * Cotiza el upgrade sin ejecutarlo, para mostrarle al administrador cuánto se
 * le abona por el tiempo que ya pagó antes de que confirme.
 *
 * La mejora en sí se paga como cualquier cobro (`useSimulatePayment` o la
 * pasarela, con `upgradeTo`).
 */
export function useUpgradeQuote(conjuntoId: string, plan: string) {
  const api = new UpgradePlanService();

  return useQuery<IUpgradeQuote>({
    queryKey: ["upgrade_quote", conjuntoId, plan],
    queryFn: () => api.previewUpgrade(conjuntoId, plan),
    enabled: Boolean(conjuntoId) && Boolean(plan),
  });
}
