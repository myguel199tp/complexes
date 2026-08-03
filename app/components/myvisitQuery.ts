import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { CitofonieInsideService } from "../(panel)/my-citofonia/services/citofonieInsideService";
import { Visit } from "../(panel)/my-citofonia/services/response/visit";

const api = new CitofonieInsideService();

export function useVisitInside() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useQuery<Visit[]>({
    // Clave propia: comparte "visits" con la bitácora de portería, que ahora
    // devuelve una página en vez de un arreglo.
    queryKey: ["my-visits", conjuntoId],
    // El usuario sale del token en el backend; ya no se manda desde el cliente.
    queryFn: () => api.getMyVisits(conjuntoId!),
    enabled: !!conjuntoId,

    refetchOnWindowFocus: false,

    refetchInterval: (data) => {
      return data?.some((v) => !v.exitTime) ? 5000 : false;
    },
  });
}
