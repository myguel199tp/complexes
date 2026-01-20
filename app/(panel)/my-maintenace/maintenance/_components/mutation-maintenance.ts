import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DataMaintenanceServices } from "../../services/maintenanceServices";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { MaintenanceResponse } from "../../services/response/maintenanceResposne";
import { CreateMaintenanceRequest } from "../../services/request/crateMaintenaceRequest";

const api = new DataMaintenanceServices();

export function useCreateMaintenance() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);

  return useMutation<MaintenanceResponse, Error, CreateMaintenanceRequest>({
    mutationFn: (data) => api.addMaintenance(data),

    onSuccess: () => {
      showAlert("¡Operación exitosa!", "success");
      queryClient.invalidateQueries({ queryKey: ["common-maintenaces"] });
    },

    onError: (error) => {
      showAlert(error.message || "¡Error en el servidor!", "error");
    },
  });
}

// export function useUpdateMaintenance() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
//       const res = await service.updateMaintenance(id, data);
//       if (!res.ok) throw new Error("Error al actualizar mantenimiento");
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["maintenances"] });
//     },
//   });
// }

// export function useDeleteMaintenance() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (id: string) => {
//       const res = await service.deleteMaintenance(id);
//       if (!res.ok) throw new Error("Error al eliminar mantenimiento");
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["maintenances"] });
//     },
//   });
// }

// export function useCompleteMaintenance() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (id: string) => {
//       const res = await service.completeMaintenance(id);
//       if (!res.ok) throw new Error("Error al completar mantenimiento");
//       return res.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["maintenances"] });
//     },
//   });
// }
