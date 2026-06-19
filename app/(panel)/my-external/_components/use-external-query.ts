import { useQuery } from "@tanstack/react-query";
import { DataExternalServices } from "../services/externalService";

const api = new DataExternalServices();

export function useExternalListings(hollidayId: string) {
  return useQuery({
    queryKey: ["external-listings", hollidayId],
    queryFn: () => api.getByHolliday(hollidayId),
    enabled: !!hollidayId,
  });
}
