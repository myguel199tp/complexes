"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { ConfirmBookingPayload } from "../service/request/bokkingRequest";
import { confirmBooking } from "../service/bookingService";

export function useConfirmBooking() {
  const router = useRouter();
  const showAlert = useAlertStore((s) => s.showAlert);

  return useMutation<unknown, Error, ConfirmBookingPayload>({
    mutationFn: (payload: ConfirmBookingPayload) => confirmBooking(payload),

    onSuccess: () => {
      showAlert("Reserva confirmada con éxito 🎉", "success");
      router.push("/booking/success");
    },

    onError: (error: Error) => {
      showAlert(error.message, "error");
    },
  });
}
