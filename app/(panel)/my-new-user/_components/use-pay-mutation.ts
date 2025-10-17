import { useMutation } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { PayUserService } from "../services/userPayService";
import { CreateAdminFeeRequest } from "../services/request/adminFee";
import { useUiStore } from "./modal/store/new-store";

export function useMutationPayUser() {
  const showAlert = useAlertStore((state) => state.showAlert);
  const { openSideNew, setTextValue } = useUiStore();

  return useMutation({
    mutationFn: async (data: CreateAdminFeeRequest) => {
      return PayUserService(data);
    },
    onSuccess: (response) => {
      showAlert("✅ Pago registrado exitosamente", "success");

      // ✅ Guarda solo el ID del pago
      if (response?.id) {
        setTextValue(response.id);
      } else {
        console.warn(
          "⚠️ No se encontró el campo 'id' en el response:",
          response
        );
        setTextValue("");
      }

      // ✅ Abre el sidebar
      openSideNew();
    },
    onError: (error) => {
      showAlert("❌ Error al registrar el pago", "error");
      console.error("Error al registrar el pago:", error);
    },
  });
}
