import { useQuery } from "@tanstack/react-query";
import { InmovableFavoriteService } from "../../services/inmovableFavoriteServices";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export default function useQueryFavoriteInmovable() {
  const QUERY_FAVORITE_INMOVABLE = "query_favorite_inmovable";
  const storedUserId = useConjuntoStore((state) => state.userId);

  return useQuery({
    queryKey: [QUERY_FAVORITE_INMOVABLE],
    queryFn: () => InmovableFavoriteService(storedUserId),
    enabled: !!storedUserId,
  });
}
