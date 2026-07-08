"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createReviewService,
  CreateReviewPayload,
} from "../service/reviewService";
import { cancelBookingService } from "../service/cancelBookingService";

export function useCreateReview() {
  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => createReviewService(payload),
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => cancelBookingService(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
  });
}
