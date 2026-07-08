"use client";

import { useQuery } from "@tanstack/react-query";
import { ownerGuestsService } from "../../../../services/ownerGuestsService";
import { GuestResponse } from "../../../../services/response/ownerGuestsResponse";

export function useOwnerGuestsQuery(hollidayId: string, enabled: boolean) {
  return useQuery<GuestResponse[]>({
    queryKey: ["owner-guests", hollidayId],
    queryFn: () => ownerGuestsService(hollidayId),
    enabled: enabled && !!hollidayId,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
