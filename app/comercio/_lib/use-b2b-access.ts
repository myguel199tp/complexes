"use client";

import { useQuery } from "@tanstack/react-query";
import {
  B2B_ACCESS_STATUS_KEY,
  B2bAccessLimits,
  getB2bAccessStatus,
} from "../b2b/services/b2bAccessService";

/** Funcionalidades que un plan de acceso puede incluir o no. */
export type B2bFeature = "agenda" | "invoicing" | "assistant";

const FEATURE_FLAG: Record<B2bFeature, keyof B2bAccessLimits> = {
  agenda: "hasAgenda",
  invoicing: "hasInvoicing",
  assistant: "hasAssistant",
};

/**
 * Lo que el comercio puede hacer con el plan que pagó.
 *
 * Esconder lo que no incluye el plan es cortesía, no seguridad: el backend
 * vuelve a validar cada acción. Sirve para no ofrecer un botón que sólo
 * devolvería un 403.
 */
export function useB2bAccess({ enabled = true }: { enabled?: boolean } = {}) {
  const { data: status, isLoading } = useQuery({
    queryKey: B2B_ACCESS_STATUS_KEY,
    queryFn: getB2bAccessStatus,
    enabled,
  });

  /** A un B2C no le aplica ningún tope; mientras carga no se decide nada. */
  const applies = status?.applies ?? false;

  const can = (feature: B2bFeature): boolean => {
    if (!status) return false;
    if (!applies) return true;

    return status.planActive && status.limits[FEATURE_FLAG[feature]] === true;
  };

  /** Cuántos elementos más admite el tope; null = sin tope. */
  const remaining = (limit: "servicePlans" | "activeContracts") => {
    if (!status || !applies) return null;

    const max =
      limit === "servicePlans"
        ? status.limits.maxServicePlans
        : status.limits.maxActiveContracts;

    if (max === null) return null;

    const used =
      limit === "servicePlans"
        ? (status.usage?.servicePlans ?? 0)
        : (status.usage?.activeContracts ?? 0);

    return Math.max(max - used, 0);
  };

  return {
    status,
    isLoading,
    applies,
    planName: status?.plan?.name ?? null,
    limits: status?.limits ?? null,
    usage: status?.usage ?? null,
    can,
    remaining,
  };
}
