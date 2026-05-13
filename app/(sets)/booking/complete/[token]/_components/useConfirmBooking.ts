"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { useAlertStore } from "@/app/components/store/useAlertStore";
import { route } from "@/app/_domain/constants/routes";

import { ConfirmBookingPayload } from "../service/request/bokkingRequest";
import { confirmBooking } from "../service/bookingService";

interface ConfirmBookingResponse {
  success: boolean;
  bookingId: string;
  status: string;
  message: string;
}

export function useConfirmBooking() {
  const router = useRouter();

  const showAlert = useAlertStore((s) => s.showAlert);

  return useMutation<ConfirmBookingResponse, Error, ConfirmBookingPayload>({
    mutationFn: confirmBooking,

    onSuccess: (data) => {
      showAlert(data.message || "Reserva confirmada con éxito 🎉", "success");

      router.push(route.myvacations);
    },

    onError: (error) => {
      showAlert(error.message || "Error confirmando la reserva", "error");
    },
  });
}
