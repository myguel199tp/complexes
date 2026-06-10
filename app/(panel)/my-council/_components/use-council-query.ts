"use client";
import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { CouncilService } from "../services/councilServices";

const api = new CouncilService();

export function useCouncilMembersQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const query = useQuery({
    queryKey: ["council_members", conjuntoId],
    queryFn: () => api.getMembers(String(conjuntoId)),
    enabled: !!conjuntoId,
  });

  return { ...query, conjuntoId };
}

export function useCouncilStatusQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const query = useQuery({
    queryKey: ["council_status", conjuntoId],
    queryFn: () => api.getCouncilStatus(String(conjuntoId)),
    enabled: !!conjuntoId,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return { ...query, conjuntoId };
}
