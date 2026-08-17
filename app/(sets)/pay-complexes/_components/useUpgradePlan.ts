import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  IUpgradePlan,
  IUpgradeQuote,
  UpgradePlanService,
} from "../services/upgradePlanService";

/**
 * Cotiza el upgrade sin ejecutarlo, para mostrarle al administrador cuánto se
 * le abona por el tiempo que ya pagó antes de que confirme.
 */
export function useUpgradeQuote(conjuntoId: string, plan: string) {
  const api = new UpgradePlanService();

  return useQuery<IUpgradeQuote>({
    queryKey: ["upgrade_quote", conjuntoId, plan],
    queryFn: () => api.previewUpgrade(conjuntoId, plan),
    enabled: Boolean(conjuntoId) && Boolean(plan),
  });
}

export function useUpgradePlan(conjuntoId: string) {
  const api = new UpgradePlanService();
  const showAlert = useAlertStore((state) => state.showAlert);
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, IUpgradePlan>({
    mutationFn: async (data: IUpgradePlan) => {
      const response = await api.upgradePlan(conjuntoId, data);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.message || "Error al mejorar el plan");
      }

      return response.json();
    },

    onSuccess: () => {
      showAlert("¡Plan mejorado correctamente!", "success");
      queryClient.invalidateQueries({ queryKey: ["query_payment", conjuntoId] });
    },

    onError: (error: Error) => {
      showAlert(error.message || "Error en el servidor", "error");
    },
  });
}
