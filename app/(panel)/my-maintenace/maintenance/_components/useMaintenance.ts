import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataMaintenanceServices } from "../../services/maintenanceServices";
import { CreateMaintenanceRequest } from "../../services/request/crateMaintenaceRequest";
import { MaintenanceResponse } from "../../services/response/maintenanceResposne";

const service = new DataMaintenanceServices();

export const useMaintenances = (conjuntoId: string, status?: string) => {
  return useQuery<MaintenanceResponse[]>({
    queryKey: ["maintenances", conjuntoId, status],
    queryFn: () => service.getMaintenances(conjuntoId, status),
    enabled: !!conjuntoId,
  });
};

export const useCreateMaintenance = (conjuntoId: string) => {
  const queryClient = useQueryClient();

  return useMutation<MaintenanceResponse, Error, CreateMaintenanceRequest>({
    mutationFn: (data) => service.addMaintenance(conjuntoId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["maintenances", conjuntoId],
      });
    },
  });
};

export const useUpdateMaintenance = (conjuntoId: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    MaintenanceResponse,
    Error,
    { id: string; data: Partial<CreateMaintenanceRequest> }
  >({
    mutationFn: ({ id, data }) => service.updateMaintenance(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["maintenances", conjuntoId],
      });
    },
  });
};

export const useDeleteMaintenance = (conjuntoId: string) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (id) => service.deleteMaintenance(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["maintenances", conjuntoId],
      });
    },
  });
};

export const useCompleteMaintenance = (conjuntoId: string) => {
  const queryClient = useQueryClient();

  return useMutation<MaintenanceResponse, Error, string>({
    mutationFn: (id) => service.completeMaintenance(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["maintenances", conjuntoId],
      });
    },
  });
};
