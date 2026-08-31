import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { DataExternalStayServices } from "../services/externalStayService";

const api = new DataExternalStayServices();

export function useExternalStays(externalListingId: string) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useQuery({
    queryKey: ["external-stays", externalListingId, conjuntoId],
    queryFn: () => api.getStaysByListing(externalListingId, String(conjuntoId)),
    enabled: !!externalListingId && !!conjuntoId,
  });
}

/**
 * Días ocupados del inmueble, para tacharlos en el calendario del formulario.
 *
 * La key incluye "busy-dates" y no cuelga de `["external-stays", id]`: las
 * mutaciones invalidan ese prefijo y así el calendario se refresca solo cuando
 * se registra o se cancela una estadía.
 */
export function useBusyDates(externalListingId: string) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useQuery({
    queryKey: ["external-stays", externalListingId, conjuntoId, "busy-dates"],
    queryFn: () => api.getBusyDates(externalListingId, String(conjuntoId)),
    enabled: !!externalListingId && !!conjuntoId,
  });
}
