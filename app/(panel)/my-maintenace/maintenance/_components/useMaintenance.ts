import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataMaintenanceServices } from "../../services/maintenanceServices";

const service = new DataMaintenanceServices();

export const useMaintenances = (conjuntoId: string, status?: string) => {
  return useQuery({
    queryKey: ["maintenances", conjuntoId, status],
    queryFn: async () => {
      const res = await service.getMaintenances(conjuntoId, status);
      if (!res.ok) throw new Error("Error cargando mantenimientos");
      return res.json();
    },
    enabled: !!conjuntoId,
  });
};

export const useCreateMaintenance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FormData) => {
      const res = await service.addMaintenance(data);
      if (!res.ok) throw new Error("Error creando mantenimiento");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenances"] });
    },
  });
};

export const useUpdateMaintenance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: FormData }) => {
      const res = await service.updateMaintenance(id, data);
      if (!res.ok) throw new Error("Error actualizando mantenimiento");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenances"] });
    },
  });
};

export const useDeleteMaintenance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await service.deleteMaintenance(id);
      if (!res.ok) throw new Error("Error eliminando mantenimiento");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenances"] });
    },
  });
};

export const useCompleteMaintenance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await service.completeMaintenance(id);
      if (!res.ok) throw new Error("Error completando mantenimiento");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenances"] });
    },
  });
};
