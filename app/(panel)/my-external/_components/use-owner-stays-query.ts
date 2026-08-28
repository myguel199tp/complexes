import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { DataExternalStayServices } from "../services/externalStayService";

const api = new DataExternalStayServices();

/**
 * Todas las estadías externas del propietario en el conjunto seleccionado.
 * El backend resuelve el propietario con el token y el conjunto con el header
 * `x-conjunto-id`, sin el cual el guard responde 403.
 */
export function useMyExternalStays() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useQuery({
    queryKey: ["external-stays", "mine", conjuntoId],
    queryFn: () => api.getMyStays(String(conjuntoId)),
    enabled: !!conjuntoId,
  });
}
