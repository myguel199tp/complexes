import { useQuery } from "@tanstack/react-query";
import { InmovableInfoService } from "../../services/inmovableInfoService";

export default function useQueryInternInmovable() {
  const QUERY_INTERN_INMMOVABLE = "query_intern_inmobable";

  return useQuery({
    queryKey: [QUERY_INTERN_INMMOVABLE],
    queryFn: () => InmovableInfoService(),

    staleTime: 1000 * 5,
  });
}
