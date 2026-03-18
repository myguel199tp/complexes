import { useMutation } from "@tanstack/react-query";
import { HollidayPayService } from "@/app/(panel)/my-holliday/services/hollidayPayService";
import { useAlertStore } from "@/app/components/store/useAlertStore";
export interface ISendOtpResponse {
  message: string;
}

export function useMutationSendOtp() {
  const api = new HollidayPayService();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation<ISendOtpResponse, Error, string>({
    mutationFn: async (email: string) => {
      return api.sendOtp(email);
    },

    onSuccess: (data) => {
      showAlert(data?.message ?? "Código OTP enviado al correo 📧", "success");
    },

    onError: (error) => {
      showAlert(
        error.message ?? "¡Ocurrió un error al enviar el OTP!",
        "error",
      );
    },
  });
}
