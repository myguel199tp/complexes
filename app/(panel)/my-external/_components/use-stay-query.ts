import { useQuery } from "@tanstack/react-query";
import { DataExternalStayServices } from "../services/externalStayService";

const api = new DataExternalStayServices();

export function useExternalStays(externalListingId: string) {
  return useQuery({
    queryKey: ["external-stays", externalListingId],
    queryFn: () => api.getStaysByListing(externalListingId),
    enabled: !!externalListingId,
  });
}
