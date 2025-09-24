import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { route } from "@/app/_domain/constants/routes";
import { DataHolidayServices } from "../../../services/hollidaServices";
import { useAlertStore } from "@/app/components/store/useAlertStore";

export function useMutationHolliday() {
  const api = new DataHolidayServices();
  const router = useRouter();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation({
    mutationFn: async (formData: FormData) => {
      return api.addHolliday(formData);
    },
    onSuccess: (response) => {
      if (response.ok) {
        showAlert("¡Operación exitosa!", "success");

        setTimeout(() => {
          router.push(route.activity);
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
