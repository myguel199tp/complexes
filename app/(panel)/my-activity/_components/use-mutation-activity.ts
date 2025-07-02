import { useMutation } from "@tanstack/react-query";
import { DataActivityServices } from "../services/activityServices";

export function useMutationActivity() {
  const api = new DataActivityServices();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.addActivity(formData);

      if (response.ok) {
        alert("Actividad guardada con exito ");
      } else {
        const errorMessage = await response.text();
        throw new Error(`Error: ${errorMessage}`);
      }
    },
  });
}
