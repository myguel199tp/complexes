import { useQuery } from "@tanstack/react-query";
import { PaginatedVisits } from "../../services/response/VisitResponse";
import {
  AllVisitParams,
  allVisitService,
} from "../../services/citofonieAllService";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

const EMPTY: PaginatedVisits = {
  data: [],
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
};

export function useVisits(params: AllVisitParams = {}) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const query = useQuery<PaginatedVisits>({
    // Los parámetros entran en la clave: si no, cambiar de página o de búsqueda
    // devolvería la caché de la consulta anterior.
    queryKey: ["visits", conjuntoId, params],
    queryFn: () => allVisitService(conjuntoId!, params),
    enabled: !!conjuntoId,
    refetchOnWindowFocus: false,
    // Evita el parpadeo a lista vacía al pasar de página.
    keepPreviousData: true,
  });

  return { ...query, result: query.data ?? EMPTY };
}
