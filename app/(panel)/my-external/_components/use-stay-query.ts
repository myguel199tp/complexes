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
