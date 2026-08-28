"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { AssignedPqrService } from "../services/assignedPqrService";
import { AllPqrResponse } from "../../my-all-pqr/services/response/AllPqrResponse";

export function useAssignedPqrQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useQuery<AllPqrResponse[]>({
    queryKey: ["pqr_assigned_to_me", conjuntoId],
    queryFn: () => AssignedPqrService(String(conjuntoId)),
    enabled: !!conjuntoId,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
