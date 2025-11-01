// src/app/(panel)/my-holliday/hooks/useMutationSendOtp.ts
import { useMutation } from "@tanstack/react-query";
import { HollidayPayService } from "@/app/(panel)/my-holliday/services/hollidayPayService";
import { useAlertStore } from "@/app/components/store/useAlertStore";

export function useMutationSendOtp() {
  const api = new HollidayPayService();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation({
    // 🔹 Lógica principal: envía el OTP
    mutationFn: async (email: string) => {
      return await api.sendOtp(email); // 👈 ya devuelve { message }
    },

    // 🔹 Si todo sale bien
    onSuccess: (data) => {
      showAlert(data.message || "Código OTP enviado al correo 📧", "success");
    },

    // 🔹 Si ocurre un error
    onError: (error: any) => {
      showAlert(
        error.message || "¡Ocurrió un error al enviar el OTP!",
        "error"
      );
    },
  });
}
