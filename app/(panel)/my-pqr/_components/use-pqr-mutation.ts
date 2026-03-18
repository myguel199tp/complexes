import { useMutation } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { route } from "@/app/_domain/constants/routes";
import { useRouter } from "next/navigation";
import { DataPqrServices } from "../services/pqrServices";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export function useMutationCertificationPqr() {
  const api = new DataPqrServices();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const router = useRouter();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      try {
        const response = await api.addpqr(conjuntoId, formData);

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data?.message?.[0] || "¡Algo salió mal!");
        }

        showAlert("¡Operación exitosa!", "success");
        router.push(route.pqr);
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
