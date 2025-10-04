import { useMutation } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { PayUserService } from "../services/userPayService";
import { CreateAdminFeeRequest } from "../services/request/adminFee";

export function useMutationPayUser() {
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation({
    mutationFn: async (data: CreateAdminFeeRequest) => {
      return PayUserService(data);
    },
    onSuccess: () => {
      showAlert("✅ Pago registrado exitosamente", "success");
    },
    onError: () => {
      showAlert("❌ Error al registrar el pago", "error");
    },
  });
}
