import { useMutation } from "@tanstack/react-query";
import { CitofonieService } from "../../services/citofonieService";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";

export function useMutationVisit() {
  const api = new CitofonieService();
  const showAlert = useAlertStore((state) => state.showAlert);
  const router = useRouter();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      // Aquí solo llamamos el servicio
      return api.registerVisit(formData);
    },
    onSuccess: (response) => {
      if (response.ok) {
        showAlert("¡Operación exitosa!", "success");

        // 👇 aseguramos que navegue después del alert
        setTimeout(() => {
          router.push(route.citofonia);
        }, 100);
      } else {
        showAlert("¡Algo salió mal intenta nuevamente!", "error");
      }
    },
    onError: () => {
      showAlert("¡Error en el servidor!", "error");
    },
  });
}
