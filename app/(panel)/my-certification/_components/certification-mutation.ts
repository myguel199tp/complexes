import { useMutation } from "@tanstack/react-query";
import { DataCertificationServices } from "../services/certificationServices";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { route } from "@/app/_domain/constants/routes";
import { useRouter } from "next/navigation";

export function useMutationCertification() {
  const api = new DataCertificationServices();
  const showAlert = useAlertStore((state) => state.showAlert);
  const router = useRouter();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      try {
        const response = await api.addCertification(formData);

        // Si el status no es 2xx, lanzar un error con el message
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data?.message?.[0] || "¡Algo salió mal!");
        }

        showAlert("¡Operación exitosa!", "success");
        router.push(route.certification);
        return response;
      } catch (error: unknown) {
        // Type guard para asegurarnos que error tiene message
        const message =
          error instanceof Error ? error.message : "¡Algo salió mal!";

        showAlert(message, "error");
        throw error; // opcional: para que react-query lo registre como error
      }
    },
  });
}
