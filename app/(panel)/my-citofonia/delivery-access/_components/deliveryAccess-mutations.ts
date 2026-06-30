import { useMutation } from "@tanstack/react-query";
import { validateDeliveryAccess } from "../services/deliveryAccessService";

export function useValidateDeliveryAccess(conjuntoId: string) {
  return useMutation({
    mutationFn: (code: string) => validateDeliveryAccess(code, conjuntoId),
  });
}
