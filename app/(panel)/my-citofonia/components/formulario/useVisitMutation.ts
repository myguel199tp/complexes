import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CitofonieService } from "../../services/citofonieService";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export function useMutationVisit() {
  const api = new CitofonieService();
  const showAlert = useAlertStore((state) => state.showAlert);
  const router = useRouter();
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      return api.registerVisit(conjuntoId, formData);
    },

    onSuccess: () => {
      showAlert("¡Visita registrada correctamente!", "success");

      // La celda que acaba de tomar este visitante ya no está libre para la
      // siguiente pantalla que pregunte.
      queryClient.invalidateQueries({ queryKey: ["visitor-free-spots"] });
      queryClient.invalidateQueries({ queryKey: ["parking-availability"] });
      queryClient.invalidateQueries({ queryKey: ["visitor-occupancy"] });

      router.push(route.citofonia);
    },

    /**
     * El backend explica por qué rechazó el registro —placa faltante, celda ya
     * ocupada, celda sin seleccionar—. Un "Error registrando visitante" genérico
     * dejaba al vigilante sin saber qué corregir.
     */
    onError: (error: Error) => {
      showAlert(error.message || "¡Error registrando visitante!", "error");
    },
  });
}
