import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DataMaintenanceServices } from "../../services/maintenanceServices";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { MaintenanceResponse } from "../../services/response/maintenanceResposne";
import { CreateMaintenanceRequest } from "../../services/request/crateMaintenaceRequest";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

const api = new DataMaintenanceServices();

export function useCreateMaintenance() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  return useMutation<MaintenanceResponse, Error, CreateMaintenanceRequest>({
    mutationFn: (data) => api.addMaintenance(conjuntoId, data),

    onSuccess: () => {
      showAlert("¡Operación exitosa!", "success");
      queryClient.invalidateQueries({ queryKey: ["common-maintenaces"] });
    },

    onError: (error) => {
      showAlert(error.message || "¡Error en el servidor!", "error");
    },
  });
}
