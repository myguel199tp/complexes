import { useMutation } from "@tanstack/react-query";
import { DataCertificationServices } from "../services/certificationServices";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { route } from "@/app/_domain/constants/routes";
import { useRouter } from "next/navigation";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export function useMutationCertification() {
  const router = useRouter();
  const api = new DataCertificationServices();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation({
    mutationFn: async (formData: FormData) => {
      try {
        const response = await api.addCertification(conjuntoId, formData);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data?.message?.[0] || "¡Algo salió mal!");
        }

        showAlert("¡Operación exitosa!", "success");
        router.push(route.certification);
        return response;
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "¡Algo salió mal!";

        showAlert(message, "error");
        throw error;
      }
    },
  });
}
