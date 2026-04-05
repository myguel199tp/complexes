import { useQuery } from "@tanstack/react-query";
import { InmovableInfoService } from "../../services/inmovableInfoService";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export default function useQueryInternInmovable() {
  const QUERY_INTERN_INMMOVABLE = "query_intern_inmobable";
  const storedUserId = useConjuntoStore((state) => state.userId);
  console.log("llega", storedUserId);
  return useQuery({
    queryKey: [QUERY_INTERN_INMMOVABLE],
    queryFn: () => InmovableInfoService(storedUserId),
    enabled: !!storedUserId,
    staleTime: 1000 * 5,
  });
}
