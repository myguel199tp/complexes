"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  PortfolioFilters,
  PortfolioService,
} from "../services/portfolioService";

const PORTFOLIO_KEY = "admin-fee-portfolio";

/** "1 dic": el día en que se renueva el cupo de cobros, en hora de Colombia. */
export const formatResetDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    timeZone: "America/Bogota",
  });

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

    onSuccess: (data) => {
      const channel = data.emailed
        ? "por correo y notificación"
        : "solo por notificación (la unidad no tiene correo registrado)";

      const left = Math.max(0, data.remindersLimit - data.remindersUsed);
      const quota = left
        ? `Le queda ${left} cobro más este mes.`
        : `Podrás volver a cobrarle desde el ${formatResetDate(data.remindersResetAt)}.`;

      showAlert(`Cobro enviado ${channel}. ${quota}`, "success");
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

      const skipped = data.skipped
        ? ` ${data.skipped} unidad(es) ya agotaron sus cobros de este mes ` +
          `y no se incluyeron (se renueva el ${formatResetDate(data.resetsAt)}).`
        : "";

      if (!data.targeted && !data.failed?.length) {
        showAlert(
          data.skipped
            ? `No se envió ningún cobro: ${data.skipped} unidad(es) ya agotaron ` +
                `sus cobros de este mes. Se renueva el ${formatResetDate(data.resetsAt)}.`
            : "No hay unidades con saldo pendiente en ese tramo.",
          "error",
        );
        return;
      }

      /**
       * Los fallos por unidad no detienen la gestión, pero el administrador
       * tiene que saber a quién no le llegó: si no, da por cobrado a alguien
       * que nunca recibió el aviso.
       */
      if (data.failed?.length) {
        showAlert(
          `Se enviaron ${data.sent} de ${data.targeted} recordatorios. ` +
            `${data.failed.length} no salieron.${skipped}`,
          "error",
        );
        return;
      }

      const byEmail =
        data.emailed === data.sent
          ? "por correo y notificación"
          : `(${data.emailed} también por correo; el resto no tiene correo registrado)`;

      showAlert(
        `Se enviaron ${data.sent} cobros ${byEmail}.${skipped}`,
        "success",
      );
    },

    onError: (error: Error) => {
      showAlert(error.message || "No se pudo enviar la gestión", "error");
    },
  });
}
