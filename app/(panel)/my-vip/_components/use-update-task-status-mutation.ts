"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { taskService } from "../services/myTaskcreateService";
import { TaskStatus } from "../services/response/taskResponse";

export function useUpdateTaskStatusMutation() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) =>
      taskService.updateStatus(conjuntoId, taskId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks-all"] });
      queryClient.invalidateQueries({ queryKey: ["tasks-mine"] });
      showAlert("Estado actualizado", "success");
    },
    onError: (error: Error) => {
      showAlert(error.message || "Error al actualizar estado", "error");
    },
  });
}
