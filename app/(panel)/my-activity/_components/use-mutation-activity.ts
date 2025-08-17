import { useMutation } from "@tanstack/react-query";
import { DataActivityServices } from "../services/activityServices";
import { useAlertStore } from "@/app/components/store/useAlertStore";

export function useMutationActivity() {
  const api = new DataActivityServices();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.addActivity(formData);

      if (response.ok) {
        showAlert("¡Operación exitosa!", "success");
      } else {
        const errorMessage = await response.text();
        throw new Error(`Error: ${errorMessage}`);
      }
    },
  });
}
