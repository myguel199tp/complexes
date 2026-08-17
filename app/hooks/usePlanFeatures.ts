"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

/**
 * Funciones que incluye el plan del conjunto activo.
 *
 * Espeja `planFeatures()` del backend. El front lo usa solo para pintar la UI
 * —mostrar deshabilitado lo que el plan no cubre—; quien autoriza de verdad es
 * el `PlanGuard` de cada ruta, así que nunca se asume permiso por esto.
 */
export interface PlanFeatures {
  plan: string;
  groupChat: boolean;
  portfolio: boolean;
  legalCollection: boolean;
  adminFeeAudit: boolean;
}

/** Mientras carga se asume el plan más restrictivo: nada habilitado. */
const RESTRICTED: PlanFeatures = {
  plan: "basic",
  groupChat: false,
  portfolio: false,
  legalCollection: false,
  adminFeeAudit: false,
};

export function usePlanFeatures() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  const query = useQuery<PlanFeatures>({
    queryKey: ["plan-features", conjuntoId],
    queryFn: async () => {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/conjuntos/plan-features`,
        {
          method: "GET",
          headers: { "x-conjunto-id": conjuntoId },
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("No se pudieron cargar las funciones del plan");
      }

      return response.json();
    },
    enabled: !!conjuntoId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    features: query.data ?? RESTRICTED,
    isLoading: query.isLoading,
  };
}
