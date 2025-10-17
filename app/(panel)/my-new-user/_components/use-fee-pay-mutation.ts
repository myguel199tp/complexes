import { useMutation } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { PayFeeUserService } from "../services/userPayFeeService";
import { CreateAdminPayFeeRequest } from "../services/request/adminFeePayRequest";

export function useMutationFeePayUser() {
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation({
    mutationFn: async (data: CreateAdminPayFeeRequest) => {
      return PayFeeUserService(data);
    },
    onSuccess: () => {
      showAlert("✅ Pago registrado exitosamente", "success");
    },
    onError: () => {
      showAlert("❌ Error al registrar el pago", "error");
    },
  });
}
