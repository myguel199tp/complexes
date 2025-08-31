import { useMutation } from "@tanstack/react-query";
import { DataCertificationServices } from "../services/certificationServices";
import { useAlertStore } from "@/app/components/store/useAlertStore";

export function useMutationCertification() {
  const api = new DataCertificationServices();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.addCertification(formData);

      if (response.ok) {
        showAlert("¡Operación exitosa!", "success");
      } else {
        const errorMessage = await response.text();
        throw new Error(`Error: ${errorMessage}`);
      }
    },
  });
}
