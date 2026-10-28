import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DataCertificationServices } from "../services/certificationServices";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { route } from "@/app/_domain/constants/routes";
import { useRouter } from "next/navigation";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { CONTENT_QUOTA_KEY } from "@/app/components/content-quota/use-content-quota";

export function useMutationCertification() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const api = new DataCertificationServices();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation({
    mutationFn: async (formData: FormData) => {
      try {
        const response = await api.addCertification(conjuntoId, formData);

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          // El backend manda `message` como texto o como lista; con `[0]`
          // sobre un texto solo se veía la primera letra.
          const message = Array.isArray(data?.message)
            ? data.message.join(", ")
            : data?.message;
          throw new Error(message || "¡Algo salió mal!");
        }

        showAlert("¡Operación exitosa!", "success");
        router.push(route.mycertification);
        return response;
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "¡Algo salió mal!";

        showAlert(message, "error");
        throw error;
      } finally {
        // Subió o lo rechazó el cupo: en los dos casos el contador cambia.
        queryClient.invalidateQueries({
          queryKey: [CONTENT_QUOTA_KEY, "documents"],
        });
      }
    },
  });
}
