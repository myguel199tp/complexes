import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { route } from "@/app/_domain/constants/routes";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { DataRecomendationServices } from "@/app/(panel)/my-holliday/services/hollidayRecomendationService";
import { CreateRecommendationsRequest } from "@/app/(panel)/my-holliday/services/request/recomendationHolidayResponse";

export function useMutationRecomendation() {
  const api = new DataRecomendationServices();
  const router = useRouter();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation({
    mutationFn: async (form: CreateRecommendationsRequest) => {
      return await api.addRecomendation(form);
    },

    onSuccess: () => {
      showAlert("¡Recomendaciones registradas!", "success");
      router.push(route.vacations);
    },

    onError: (error: any) => {
      showAlert(error.message || "¡Error en el servidor!", "error");
    },
  });
}
