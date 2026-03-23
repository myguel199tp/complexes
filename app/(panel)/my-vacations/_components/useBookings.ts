// hooks/useBookingById.ts

import { useQuery } from "@tanstack/react-query";
import { getBookingByIdService } from "../service/getBookingsService";

export function useBookingById(id: string) {
  return useQuery({
    queryKey: ["booking", id],
    queryFn: () => getBookingByIdService(id),
    enabled: !!id, // importante
  });
}
