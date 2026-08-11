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
      // La lista de "dentro" se cachea bajo ["visits", conjuntoId]; invalidar
      // "visitsInside" no refrescaba nada y el visitante seguía apareciendo.
      queryClient.invalidateQueries({
        queryKey: ["visits"],
      });

      // La salida libera la celda de visitantes que retenía la visita.
      queryClient.invalidateQueries({ queryKey: ["visitor-free-spots"] });
      queryClient.invalidateQueries({ queryKey: ["parking-availability"] });
      queryClient.invalidateQueries({ queryKey: ["visitor-occupancy"] });
    },
  });
};
