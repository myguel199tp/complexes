import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { ResolvePqrService, ResolveBody } from "../services/resolveService";

export function useResolveMutation() {
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ResolveBody }) => {
      try {
        const response = await ResolvePqrService(conjuntoId, id, data);

        if (!response.ok) {
          const responseData = await response.json();
          throw new Error(responseData?.message?.[0] || "¡Algo salió mal!");
        }

        showAlert("Respuesta registrada exitosamente", "success");
        queryClient.invalidateQueries({ queryKey: ["pqr-all", conjuntoId] });
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
