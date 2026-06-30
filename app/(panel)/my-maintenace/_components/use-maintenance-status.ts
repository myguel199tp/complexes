"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { DataCommmonAreaServices } from "../services/commonAreaServices";
import { DataProviderServices } from "../services/providerServices";

const areaApi = new DataCommmonAreaServices();
const providerApi = new DataProviderServices();

export function useMaintenanceStatus() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const areasQuery = useQuery({
    queryKey: ["query_info_area", conjuntoId],
    queryFn: () => areaApi.getCommmonArea(String(conjuntoId)),
    enabled: !!conjuntoId,
  });

  const providersQuery = useQuery({
    queryKey: ["query_info_provider", conjuntoId],
    queryFn: () => providerApi.getProviders(String(conjuntoId)),
    enabled: !!conjuntoId,
  });

  const areasCount = areasQuery.data?.length ?? 0;
  const providersCount = providersQuery.data?.length ?? 0;

  return {
    isLoading: areasQuery.isLoading || providersQuery.isLoading,
    areasCount,
    providersCount,
    hasAreas: areasCount > 0,
    hasProviders: providersCount > 0,
  };
}
