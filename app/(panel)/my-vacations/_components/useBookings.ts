// hooks/useMyBookings.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyBookingsService } from "../service/getBookingsService";
import { MyBookingResponse } from "../service/response/BookingResponse";

export function useMyBookings() {
  return useQuery<MyBookingResponse[]>({
    queryKey: ["my-bookings"],
    queryFn: getMyBookingsService,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
