import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  VisitStats,
  visitStatsService,
} from "../../services/citofonieStatsService";

const EMPTY: VisitStats = {
  totalVisits: 0,
  parkingUsage: { with: 0, without: 0 },
  paymentStatusBreakdown: [],
  parkingRevenueByMonth: [],
  parkingRevenueTotal: 0,
};

export function useVisitStats() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const query = useQuery<VisitStats>({
    queryKey: ["visit-stats", conjuntoId],
    queryFn: () => visitStatsService(conjuntoId!),
    enabled: !!conjuntoId,
    refetchOnWindowFocus: false,
  });

  return { ...query, stats: query.data ?? EMPTY };
}
