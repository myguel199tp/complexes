"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  createReviewService,
  CreateReviewPayload,
} from "../service/reviewService";
import { cancelBookingService } from "../service/cancelBookingService";
import { resumeBookingService } from "../service/resumeBookingService";

/**
 * Retoma una reserva pendiente: pide un enlace nuevo y abre la misma página
 * de confirmar a la que lleva la reserva recién creada.
 */
export function useResumeBooking() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => resumeBookingService(bookingId),
    onSuccess: (data) => {
      router.push(`/booking/complete/${data.token}`);
    },
    // Si ya venció, la tarjeta tiene que dejar de ofrecerlo.
    onError: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => createReviewService(payload),
    // La tarjeta pasa de "califica" a "tu calificación".
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
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
