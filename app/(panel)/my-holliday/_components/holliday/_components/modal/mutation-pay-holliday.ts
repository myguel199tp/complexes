import { useMutation } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { HollidayPayService } from "@/app/(panel)/my-holliday/services/hollidayPayService";
import { RegisterOptionsHollidayPayRequest } from "@/app/(panel)/my-holliday/services/request/registerHollidayPayRequest";
import { RegisterHollidayPayResponse } from "@/app/(panel)/my-holliday/services/response/RegisterHollidayPayResponse";

/**
 * Registra la cuenta y la asigna al inmueble desde el que se abrió el modal.
 * Antes solo registraba y mandaba al formulario de crear inmueble: la cuenta
 * quedaba guardada pero ningún inmueble la usaba.
 */
export function useMutationPayHolliday(
  hollidayId: string | undefined,
  onDone: () => void,
) {
  const api = new HollidayPayService();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation<
    RegisterHollidayPayResponse,
    Error,
    RegisterOptionsHollidayPayRequest
  >({
    mutationFn: async (formData: RegisterOptionsHollidayPayRequest) => {
      const result = await api.registerPayment(formData);

      if (!result.data) {
        throw new Error(
          result.message ||
            "Ocurrió un error desconocido al registrar el holiday",
        );
      }

      if (hollidayId) {
        await api.assignToHolliday(conjuntoId, hollidayId, result.data.id);
      }

      return result;
    },

    onSuccess: () => {
      showAlert("Cuenta de pago guardada para este inmueble", "success");
      onDone();
    },

    onError: (error: Error) => {
      showAlert(error.message || "¡Error en el servidor!", "error");
    },
  });
}
