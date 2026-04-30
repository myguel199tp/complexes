import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { CitofonieInsideService } from "../(panel)/my-citofonia/services/citofonieInsideService";
import { Visit } from "../(panel)/my-citofonia/services/response/visit";

const api = new CitofonieInsideService();

export function useVisitInside() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const storedUserId = useConjuntoStore((state) => state.userId);

  return useQuery<Visit[]>({
    queryKey: ["visits", conjuntoId],
    queryFn: () => api.getMyVisits(conjuntoId!, storedUserId),
    enabled: !!conjuntoId,

    refetchOnWindowFocus: false,

    refetchInterval: (data) => {
      return data?.some((v) => !v.exitTime) ? 5000 : false;
    },
  });
}
