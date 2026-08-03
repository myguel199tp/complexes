import { useMutation, useQueryClient } from "@tanstack/react-query";
import { validateAccessCode } from "../../services/accessPassService";

/**
 * Antes solo validaba códigos de domicilios (`DR-`). Ahora pega contra el
 * endpoint unificado, que resuelve también los pases de residente (`AP-`) y los
 * códigos de huésped vacacional (`GA-`) — y en los tres casos deja el registro
 * en la bitácora de portería, que era justo lo que faltaba.
 */
export function useValidateAccessCode(conjuntoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => validateAccessCode(conjuntoId, code),

    onSuccess: () => {
      // El acceso creó una visita: la bitácora y el panel de "dentro" cambiaron.
      queryClient.invalidateQueries({ queryKey: ["visits"] });
      queryClient.invalidateQueries({ queryKey: ["visitsInside"] });
    },
  });
}
