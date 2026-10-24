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
  getHostBlockedDates,
  unblockHollidayDates,
} from "../../../../services/hollidayAvailabilityAdminService";
import { AvailabilityDay } from "../../../../services/response/availabilityResponse";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

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
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation({
    mutationFn: (dates: string[]) =>
      blockHollidayDates(hollidayId, dates, conjuntoId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["holliday-availability", hollidayId],
      });
      queryClient.invalidateQueries({
        queryKey: ["holliday-blocked-dates", hollidayId],
      });
      queryClient.invalidateQueries({
        queryKey: ["holliday-host-blocked-dates", hollidayId],
      });
    },
  });
}

export function useHostBlockedDates(hollidayId: string, enabled: boolean) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useQuery<string[]>({
    queryKey: ["holliday-host-blocked-dates", hollidayId],
    queryFn: () => getHostBlockedDates(hollidayId, conjuntoId),
    enabled: enabled && !!hollidayId,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useUnblockDatesMutation(hollidayId: string) {
  const queryClient = useQueryClient();
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation({
    mutationFn: (dates: string[]) =>
      unblockHollidayDates(hollidayId, dates, conjuntoId),
    onSuccess: () => {
      for (const key of [
        "holliday-availability",
        "holliday-blocked-dates",
        "holliday-host-blocked-dates",
      ]) {
        queryClient.invalidateQueries({ queryKey: [key, hollidayId] });
      }
    },
  });
}
