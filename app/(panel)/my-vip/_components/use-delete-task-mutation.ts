"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { taskService } from "../services/myTaskcreateService";

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation({
    mutationFn: (taskId: string) => taskService.deleteTask(conjuntoId, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks-all"] });
      queryClient.invalidateQueries({ queryKey: ["tasks-mine"] });
      showAlert("Tarea eliminada correctamente", "success");
    },
    onError: (error: Error) => {
      showAlert(error.message || "Error al eliminar la tarea", "error");
    },
  });
}
