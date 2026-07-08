"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  blockHollidayDates,
  getHollidayAvailability,
  getHollidayBlockedDates,
} from "../../../../services/hollidayAvailabilityAdminService";
import { AvailabilityDay } from "../../../../services/response/availabilityResponse";

export function useHollidayAvailability(hollidayId: string, enabled: boolean) {
  return useQuery<AvailabilityDay[]>({
    queryKey: ["holliday-availability", hollidayId],
    queryFn: () => getHollidayAvailability(hollidayId),
    enabled: enabled && !!hollidayId,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useHollidayBlockedDates(hollidayId: string, enabled: boolean) {
  return useQuery<string[]>({
    queryKey: ["holliday-blocked-dates", hollidayId],
    queryFn: () => getHollidayBlockedDates(hollidayId),
    enabled: enabled && !!hollidayId,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useBlockDatesMutation(hollidayId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dates: string[]) => blockHollidayDates(hollidayId, dates),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["holliday-availability", hollidayId],
      });
      queryClient.invalidateQueries({
        queryKey: ["holliday-blocked-dates", hollidayId],
      });
    },
  });
}
