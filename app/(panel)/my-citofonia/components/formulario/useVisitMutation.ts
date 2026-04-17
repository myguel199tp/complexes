import { useMutation } from "@tanstack/react-query";
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

  return useMutation({
    mutationFn: async (formData: FormData) => {
      return api.registerVisit(conjuntoId, formData);
    },

    onSuccess: () => {
      showAlert("¡Visita registrada correctamente!", "success");
      router.push(route.citofonia);
    },

    onError: () => {
      showAlert("¡Error registrando visitante!", "error");
    },
  });
}
