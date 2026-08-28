import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { DataExternalServices } from "../services/externalService";

const api = new DataExternalServices();

export function useExternalListings(hollidayId: string) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useQuery({
    queryKey: ["external-listings", hollidayId, conjuntoId],
    queryFn: () => api.getByHolliday(hollidayId, String(conjuntoId)),
    enabled: !!hollidayId && !!conjuntoId,
  });
}
