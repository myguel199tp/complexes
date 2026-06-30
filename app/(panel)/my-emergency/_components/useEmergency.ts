import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DataEmergencyServices } from "../services/emergencyServices";
import {
  ActivateEmergencyRequest,
  ResolveEmergencyRequest,
} from "../services/request/activateEmergencyRequest";
import {
  EmergencyDashboardResponse,
  EmergencyEventResponse,
  EmergencyPriority,
  EmergencyReportResponse,
  EmergencyResponse,
} from "../services/response/emergencyResponse";

const service = new DataEmergencyServices();

export const ACTIVE_EMERGENCY_KEY = "active-emergency";

export const useActiveEmergency = (conjuntoId: string) => {
  return useQuery<EmergencyResponse | null>({
    queryKey: [ACTIVE_EMERGENCY_KEY, conjuntoId],
    queryFn: () => service.getActive(conjuntoId),
    enabled: !!conjuntoId,
    refetchInterval: 15000,
    retry: 1,
  });
};

export const useActivateEmergency = (conjuntoId: string) => {
  const queryClient = useQueryClient();

  return useMutation<EmergencyResponse, Error, ActivateEmergencyRequest>({
    mutationFn: (data) => service.activate(conjuntoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ACTIVE_EMERGENCY_KEY, conjuntoId],
      });
    },
  });
};

export const useResolveEmergency = (conjuntoId: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    EmergencyResponse,
    Error,
    { id: string; data: ResolveEmergencyRequest }
  >({
    mutationFn: ({ id, data }) => service.resolve(id, conjuntoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [ACTIVE_EMERGENCY_KEY, conjuntoId],
      });
    },
  });
};

export const useEmergencyDashboard = (id: string | undefined, conjuntoId: string) => {
  return useQuery<EmergencyDashboardResponse>({
    queryKey: ["emergency-dashboard", id, conjuntoId],
    queryFn: () => service.getDashboard(id!, conjuntoId),
    enabled: !!id && !!conjuntoId,
    refetchInterval: 5000,
  });
};

export const useEmergencyReports = (
  id: string | undefined,
  conjuntoId: string,
  filters: { priority?: EmergencyPriority; tower?: string } = {},
) => {
  return useQuery<EmergencyReportResponse[]>({
    queryKey: ["emergency-reports", id, conjuntoId, filters],
    queryFn: () => service.getReports(id!, conjuntoId, filters),
    enabled: !!id && !!conjuntoId,
    refetchInterval: 5000,
  });
};

export const useEmergencyTimeline = (id: string | undefined, conjuntoId: string) => {
  return useQuery<EmergencyEventResponse[]>({
    queryKey: ["emergency-timeline", id, conjuntoId],
    queryFn: () => service.getTimeline(id!, conjuntoId),
    enabled: !!id && !!conjuntoId,
    refetchInterval: 10000,
  });
};

export const useSetBrigadeMember = (conjuntoId: string) => {
  const queryClient = useQueryClient();

  return useMutation<
    void,
    Error,
    { relationId: string; isBrigadeMember: boolean }
  >({
    mutationFn: ({ relationId, isBrigadeMember }) =>
      service.setBrigadeMember(relationId, conjuntoId, isBrigadeMember),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["query_user_register"] });
    },
  });
};
