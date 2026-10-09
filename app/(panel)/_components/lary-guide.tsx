"use client";

import { useCallback, useMemo } from "react";

import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useSidebarInformation } from "@/app/components/ui/sidebar-information";
import { roleRoutes } from "@/app/_domain/constants/roleRoutes";
import { isRouteAllowedByPlan } from "@/app/_domain/constants/planRoutes";
import { usePlanFeatures } from "@/app/hooks/usePlanFeatures";
import LaryGuideView, {
  matchesRoute,
} from "@/app/components/lary-guide/lary-guide-view";
import {
  AssistantGuideService,
  type AssistantGuidePlace,
} from "../my-new-user/services/assistantGuideService";

export {
  OPEN_GUIDE_EVENT,
  openLaryGuide,
} from "@/app/components/lary-guide/lary-guide-view";

const guideService = new AssistantGuideService();

/** Toda ruta que algún rol declara: las demás las abre cualquiera con sesión. */
const DECLARED_ROUTES = Array.from(
  new Set(Object.values(roleRoutes).flatMap((routes) => [...routes])),
);

/** Mismo criterio que el middleware: si no lo deja entrar, no se le ofrece. */
function allowedByRole(path: string, roles: string[]): boolean {
  if (!DECLARED_ROUTES.some((route) => matchesRoute(path, route))) return true;

  return roles.some((role) =>
    (roleRoutes[role as keyof typeof roleRoutes] ?? []).some((route) =>
      matchesRoute(path, route),
    ),
  );
}

/**
 * 📖 Guía de Lary del panel del conjunto.
 *
 * Va montada en el layout del panel: la ven también los roles sin chat de
 * Lary. "Llévame ahí" solo se ofrece si el rol (`roleRoutes`) y el plan del
 * conjunto abren la ruta.
 */
export default function LaryGuide() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const { valueState } = useSidebarInformation();
  const roles: string[] = useMemo(
    () => valueState.userRolName ?? [],
    [valueState.userRolName],
  );
  const { features } = usePlanFeatures();

  const load = useCallback(
    () => guideService.get(String(conjuntoId)),
    [conjuntoId],
  );

  const markSeen = useCallback(
    (guideId: string) => {
      if (conjuntoId) void guideService.markSeen(String(conjuntoId), guideId);
    },
    [conjuntoId],
  );

  const canGo = useCallback(
    (place: AssistantGuidePlace) =>
      !place.path ||
      (allowedByRole(place.path, roles) &&
        isRouteAllowedByPlan(place.path, features)),
    [roles, features],
  );

  return (
    <LaryGuideView
      load={conjuntoId ? load : null}
      markSeen={markSeen}
      canGo={canGo}
    />
  );
}
