"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  getProfileChangeLogService,
  markProfileChangesSeenService,
} from "../services/profileChangeLogService";

// Key propia: compartirla con otra queryFn hace que React Query devuelva
// datos de la consulta equivocada.
const QUERY_PROFILE_CHANGES = "query_profile_change_log";

export function useProfileChangesQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useQuery({
    queryKey: [QUERY_PROFILE_CHANGES, conjuntoId],
    queryFn: () => getProfileChangeLogService(String(conjuntoId)),
    enabled: !!conjuntoId,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useMarkProfileChangesSeen() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markProfileChangesSeenService(String(conjuntoId)),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_PROFILE_CHANGES, conjuntoId],
      });
    },
  });
}
