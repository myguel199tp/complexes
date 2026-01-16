import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DataMaintenanceServices } from "../services/maintenanceServices";

const service = new DataMaintenanceServices();

export function useCreateMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const res = await service.addMaintenance(data);
      if (!res.ok) throw new Error("Error al crear mantenimiento");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenances"] });
    },
  });
}

export function useUpdateMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const res = await service.updateMaintenance(id, data);
      if (!res.ok) throw new Error("Error al actualizar mantenimiento");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenances"] });
    },
  });
}

export function useDeleteMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await service.deleteMaintenance(id);
      if (!res.ok) throw new Error("Error al eliminar mantenimiento");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenances"] });
    },
  });
}

export function useCompleteMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await service.completeMaintenance(id);
      if (!res.ok) throw new Error("Error al completar mantenimiento");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenances"] });
    },
  });
}
