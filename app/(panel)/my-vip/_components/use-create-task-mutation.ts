"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { taskService } from "../services/myTaskcreateService";
import { TasksRequest } from "../services/request/taskRequest";

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation({
    mutationFn: (data: TasksRequest) => taskService.createTask(conjuntoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks-all"] });
      queryClient.invalidateQueries({ queryKey: ["tasks-mine"] });
      showAlert("Tarea creada correctamente", "success");
    },
    onError: (error: Error) => {
      showAlert(error.message || "Error al crear la tarea", "error");
    },
  });
}
