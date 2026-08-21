"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  ActivityRevenueSummary,
  MaintenanceCostSummary,
  PeriodRange,
  activityRevenueService,
  maintenanceCostService,
} from "../../services/financeSourcesService";

const EMPTY = { byMonth: [], total: 0 };

/**
 * Fuentes de dinero que no pasan por cuotas ni por el módulo de gastos.
 *
 * Los agregados los calcula el backend en SQL y ya vienen acotados al período:
 * traerse el detalle para sumarlo en el navegador repetiría el problema que
 * tenía la bitácora de portería.
 */
export function useMaintenanceCosts(range: PeriodRange = {}) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const query = useQuery<MaintenanceCostSummary>({
    queryKey: ["maintenance-costs", conjuntoId, range.from ?? "", range.to ?? ""],
    queryFn: () => maintenanceCostService(conjuntoId!, range),
    enabled: !!conjuntoId,
    refetchOnWindowFocus: false,
  });

  return { ...query, costs: query.data ?? (EMPTY as MaintenanceCostSummary) };
}

export function useActivityRevenue(range: PeriodRange = {}) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const query = useQuery<ActivityRevenueSummary>({
    queryKey: ["activity-revenue", conjuntoId, range.from ?? "", range.to ?? ""],
    queryFn: () => activityRevenueService(conjuntoId!, range),
    enabled: !!conjuntoId,
    refetchOnWindowFocus: false,
  });

  return { ...query, revenue: query.data ?? (EMPTY as ActivityRevenueSummary) };
}
