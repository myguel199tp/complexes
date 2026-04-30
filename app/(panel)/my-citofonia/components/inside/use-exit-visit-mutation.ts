"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CitofonieExitService } from "../../services/citofonieExitService";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

const service = new CitofonieExitService();

export const useExitVisitMutation = () => {
  const queryClient = useQueryClient();
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  return useMutation({
    mutationFn: ({ id }: { id: string }) => service.exitVisit(conjuntoId, id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["visitsInside"],
      });
    },
  });
};
