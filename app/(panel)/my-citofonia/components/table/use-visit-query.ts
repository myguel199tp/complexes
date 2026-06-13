import { useQuery } from "@tanstack/react-query";
import { VisitResponse } from "../../services/response/VisitResponse";
import { allVisitService } from "../../services/citofonieAllService";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export function useVisits() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useQuery<VisitResponse[]>({
    queryKey: ["visits", conjuntoId],
    queryFn: () => allVisitService(conjuntoId!),
    enabled: !!conjuntoId,
    refetchOnWindowFocus: false,
  });
}
