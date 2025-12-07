import { useQuery } from "@tanstack/react-query";
import { InmovableFavoriteService } from "../../services/inmovableFavoriteServices";

export default function useQueryFavoriteInmovable() {
  const QUERY_FAVORITE_INMOVABLE = "query_favorite_inmovable";

  return useQuery({
    queryKey: [QUERY_FAVORITE_INMOVABLE],
    queryFn: () => InmovableFavoriteService(),

    staleTime: 1000 * 5,
  });
}
