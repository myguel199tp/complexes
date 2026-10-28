"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { backendError } from "@/app/helpers/backendError";

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
  /** Tablero de tareas: asignarlas al personal y hacerles seguimiento. */
  taskBoard: boolean;
  /** Foro del conjunto: temas y respuestas entre residentes. */
  forum: boolean;
  /** Locales comerciales del conjunto. */
  commercialLocals: boolean;
  /** Cámaras del conjunto y su archivo de grabaciones. Solo Platino. */
  cameras: boolean;
  /** Asamblea: convocatoria, asistencia y votaciones. Solo Platino. */
  assembly: boolean;
  /** Consejo de administración. Solo Platino. */
  council: boolean;
  /** Historial completo de aprobación de gastos. En Básico, últimos 90 días. */
  fullExpenseHistory: boolean;
  /** Convenios de recaudo bancario y sus referencias por unidad. */
  collectionAgreements: boolean;
  /**
   * Arriendo de celdas: contratos nuevos, cobro a externos por link y alquiler
   * entre residentes. Oro y Platino.
   */
  parkingRentals: boolean;
}

/**
 * Lo que devuelve el endpoint: las banderas del plan más contexto que no es
 * una bandera, y por eso no va en `PlanFeatures`.
 */
interface PlanFeaturesResponse extends PlanFeatures {
  /**
   * Desde cuándo se ve el historial; null si se ve completo. Lo pone el
   * Básico de por vida con el historial anual vencido: lo anterior no se
   * borra, solo deja de salir en los listados.
   */
  historySince?: string | null;
}

/** Mientras carga se asume el plan más restrictivo: nada habilitado. */
const RESTRICTED: PlanFeatures = {
  plan: "basic",
  groupChat: false,
  portfolio: false,
  legalCollection: false,
  adminFeeAudit: false,
  taskBoard: false,
  collectionAgreements: false,
  forum: false,
  commercialLocals: false,
  cameras: false,
  assembly: false,
  council: false,
  fullExpenseHistory: false,
  parkingRentals: false,
};

export function usePlanFeatures() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  const query = useQuery<PlanFeaturesResponse>({
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
        throw await backendError(
          response,
          "No se pudieron cargar las funciones del plan",
        );
      }

      return response.json();
    },
    enabled: !!conjuntoId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    features: query.data ?? RESTRICTED,
    historySince: query.data?.historySince ?? null,
    isLoading: query.isLoading,
  };
}
