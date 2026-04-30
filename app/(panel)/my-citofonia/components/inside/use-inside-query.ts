import { useQuery } from "@tanstack/react-query";
import { VisitResponse } from "../../services/response/VisitResponse";
import { CitofonieInsideService } from "../../services/citofonieInsideService";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

const api = new CitofonieInsideService();

export function useInside() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useQuery<VisitResponse[]>({
    queryKey: ["visits", conjuntoId],
    queryFn: () => api.getVisitsInside(conjuntoId!),
    enabled: !!conjuntoId,

    refetchOnWindowFocus: false,

    refetchInterval: (data) => {
      return data?.some((v) => !v.exitTime) ? 5000 : false;
    },
  });
}
