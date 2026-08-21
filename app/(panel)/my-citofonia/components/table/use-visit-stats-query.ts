import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  VisitStats,
  VisitStatsRange,
  visitStatsService,
} from "../../services/citofonieStatsService";

const EMPTY: VisitStats = {
  totalVisits: 0,
  parkingUsage: { with: 0, without: 0 },
  paymentStatusBreakdown: [],
  parkingRevenueByMonth: [],
  parkingRevenueTotal: 0,
};

/**
 * `range` entra en la queryKey para que el tablero no siga mostrando el
 * histórico completo del parqueadero cuando el usuario acota las fechas: ese
 * total se sumaba a unas cuotas que sí estaban filtradas.
 */
export function useVisitStats(range: VisitStatsRange = {}) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const query = useQuery<VisitStats>({
    queryKey: ["visit-stats", conjuntoId, range.from ?? "", range.to ?? ""],
    queryFn: () => visitStatsService(conjuntoId!, range),
    enabled: !!conjuntoId,
    refetchOnWindowFocus: false,
  });

  return { ...query, stats: query.data ?? EMPTY };
}
