import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  ResolveAllPqrService,
  ResolveAllBody,
} from "../services/resolveAllPqrService";

export function useResolveAllMutation() {
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ResolveAllBody }) => {
      try {
        const response = await ResolveAllPqrService(conjuntoId, id, data);

        if (!response.ok) {
          const responseData = await response.json();
          throw new Error(responseData?.message?.[0] || "¡Algo salió mal!");
        }

        showAlert("Respuesta registrada exitosamente", "success");
        queryClient.invalidateQueries({ queryKey: ["query_pqr", conjuntoId] });
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
