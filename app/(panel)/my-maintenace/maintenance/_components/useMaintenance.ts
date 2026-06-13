import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DataMaintenanceServices } from "../../services/maintenanceServices";
import { CreateMaintenanceRequest } from "../../services/request/crateMaintenaceRequest";
import { MaintenanceResponse } from "../../services/response/maintenanceResposne";
import { CompleteMaintenanceRequest } from "../../services/request/completeMaintenanceRequest";
import { MaintenanceHistoryResponse } from "../../services/response/maintenanceHistoryResponse";

const service = new DataMaintenanceServices();

export const useMaintenances = (conjuntoId: string) => {
  return useQuery<MaintenanceResponse[]>({
    queryKey: ["maintenances", conjuntoId],
    queryFn: () => service.getMaintenances(conjuntoId),
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
    {
      id: string;
      data: Partial<CreateMaintenanceRequest>;
    }
  >({
    mutationFn: ({ id, data }) =>
      service.updateMaintenance(id, conjuntoId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["maintenances", conjuntoId],
      });
    },
  });
};

export const useCompleteMaintenance = (conjuntoId: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    MaintenanceResponse,
    Error,
    {
      id: string;
      data: CompleteMaintenanceRequest;
    }
  >({
    mutationFn: ({ id, data }) =>
      service.completeMaintenance(id, conjuntoId, data),

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
    mutationFn: (id) => service.deleteMaintenance(id, conjuntoId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["maintenances", conjuntoId],
      });
    },
  });
};

export const useMaintenance = (id: string, conjuntoId: string) => {
  return useQuery<MaintenanceResponse>({
    queryKey: ["maintenance", id],
    queryFn: () => service.getMaintenanceById(id, conjuntoId),
    enabled: !!id && !!conjuntoId,
  });
};

export const useMaintenanceHistory = (id: string | null, conjuntoId: string) => {
  return useQuery<MaintenanceHistoryResponse[]>({
    queryKey: ["maintenance-history", id],
    queryFn: () => service.getMaintenanceHistory(id!, conjuntoId),
    enabled: !!id && !!conjuntoId,
  });
};
