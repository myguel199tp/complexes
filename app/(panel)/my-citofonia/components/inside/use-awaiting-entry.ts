"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { allVisitService } from "../../services/citofonieAllService";
import { VisitResponse } from "../../services/response/VisitResponse";
import { VisitStatus } from "../../services/response/visit";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

const AWAITING_KEY = "visitsAwaitingEntry";

/**
 * Autorizar dejaba la visita en `AUTHORIZED`: el residente aprueba, pero quien
 * registra el paso físico por la reja es la portería con `PATCH /visit/enter`.
 * Como el front no llamaba ese endpoint en ninguna parte, ninguna visita
 * llegaba nunca a `INSIDE` y la pestaña "Visitantes dentro" salía siempre
 * vacía. Esta lista es el paso que faltaba.
 */
export function useAwaitingEntry() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useQuery<VisitResponse[]>({
    queryKey: [AWAITING_KEY, conjuntoId],
    queryFn: async () => {
      const page = await allVisitService(conjuntoId!, {
        status: VisitStatus.AUTHORIZED,
        page: 1,
        limit: 50,
      });

      return page.data;
    },
    enabled: !!conjuntoId,
    refetchInterval: 10000,
  });
}

export function useEnterVisitMutation() {
  const queryClient = useQueryClient();
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/visit/enter/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-conjunto-id": conjuntoId ?? "",
          },
        },
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || "No se pudo registrar el ingreso");
      }

      return response.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AWAITING_KEY] });
      queryClient.invalidateQueries({ queryKey: ["visits"] });
    },
  });
}
