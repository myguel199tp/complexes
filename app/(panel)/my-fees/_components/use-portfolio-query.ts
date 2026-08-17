"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  PortfolioFilters,
  PortfolioService,
} from "../services/portfolioService";

const PORTFOLIO_KEY = "admin-fee-portfolio";

export function usePortfolioQuery(filters: PortfolioFilters = {}) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useQuery({
    queryKey: [PORTFOLIO_KEY, conjuntoId, filters],
    queryFn: () => PortfolioService.get(conjuntoId, filters),
    enabled: !!conjuntoId,
  });
}

/** Recordatorio de cobro a una unidad concreta. */
export function useRemindUnitMutation() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation({
    mutationFn: ({ relationId, note }: { relationId: string; note?: string }) =>
      PortfolioService.remindUnit(relationId, conjuntoId, note),

    onSuccess: () => {
      showAlert("Recordatorio enviado", "success");
    },

    onError: (error: Error) => {
      showAlert(error.message || "No se pudo enviar el recordatorio", "error");
    },
  });
}

/** Gestión de cobro masiva sobre un tramo de mora. */
export function useRemindPortfolioMutation() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const showAlert = useAlertStore((state) => state.showAlert);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: {
      minDaysOverdue: number;
      tower?: string;
      note?: string;
    }) => PortfolioService.remindPortfolio(conjuntoId, body),

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PORTFOLIO_KEY] });

      /**
       * Los fallos por unidad no detienen la gestión, pero el administrador
       * tiene que saber a quién no le llegó: si no, da por cobrado a alguien
       * que nunca recibió el aviso.
       */
      if (data.failed?.length) {
        showAlert(
          `Se enviaron ${data.sent} de ${data.targeted} recordatorios. ` +
            `${data.failed.length} no salieron.`,
          "error",
        );
        return;
      }

      showAlert(`Se enviaron ${data.sent} recordatorios de cobro.`, "success");
    },

    onError: (error: Error) => {
      showAlert(error.message || "No se pudo enviar la gestión", "error");
    },
  });
}
