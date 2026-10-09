"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";

import LaryGuideView, {
  matchesRoute,
  openLaryGuide,
} from "@/app/components/lary-guide/lary-guide-view";
import type {
  AssistantGuidePlace,
  AssistantGuideState,
} from "@/app/(panel)/my-new-user/services/assistantGuideService";
import { comercioFetch } from "../_lib/comercio-api";
import { useB2bAccess } from "../_lib/use-b2b-access";

/** Sin sesión todavía: pedir la guía daría 401 y mandaría al login. */
const NO_SESSION_PREFIXES = ["/comercio/login", "/comercio/register"];

/**
 * Dónde estorba el botón 📖: en el chat del asistente queda encima de la caja
 * de texto. La guía sigue funcionando ahí (el acompañante llega a esa página).
 */
const NO_BUTTON_PREFIXES = ["/comercio/assistant"];

/** Rutas que dependen de una funcionalidad del plan B2B. */
const FEATURE_ROUTES = [
  { route: "/comercio/b2b/agenda", feature: "agenda" },
  { route: "/comercio/b2b/invoices", feature: "invoicing" },
] as const;

function loadGuide() {
  return comercioFetch<AssistantGuideState>(
    "/assistant-guide/comercio?platform=web",
  );
}

function markGuideSeen(guideId: string) {
  // Si falla, la guía vuelve a salir en el próximo ingreso y ya.
  comercioFetch<void>("/assistant-guide/comercio/seen", {
    method: "POST",
    body: JSON.stringify({ guideId }),
  }).catch(() => undefined);
}

/**
 * 📖 Guía de Lary del panel del comercio.
 *
 * El backend arma la guía según el modelo de negocio: al B2C le habla de
 * sucursales, pedidos y domiciliarios; al B2B, de planes de servicio,
 * cotizaciones y contratos. Es la misma "ya la vio" que la de la app, así que
 * quien la vio en el celular no la recibe otra vez aquí.
 */
export default function ComercioLaryGuide() {
  const pathname = usePathname() ?? "";
  const hasSession = !NO_SESSION_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );
  const { status, can } = useB2bAccess({ enabled: hasSession });

  const canGo = useCallback(
    (place: AssistantGuidePlace) => {
      const path = place.path;
      if (!path) return true;

      // El asistente se ofrece siempre: si el plan no lo trae, su pantalla
      // explica cómo activarlo, y eso también es lo que la guía quiere enseñar.
      if (matchesRoute(path, "/comercio/assistant")) return true;

      if (!status?.applies) return true;

      // Sin plan vigente todo /comercio/b2b muestra el cobro: llevarlo ahí
      // con instrucciones de otra pantalla confunde.
      if (matchesRoute(path, "/comercio/b2b") && !status.planActive) {
        return false;
      }

      const gated = FEATURE_ROUTES.find(({ route }) => matchesRoute(path, route));
      return gated ? can(gated.feature) : true;
    },
    [status, can],
  );

  if (!hasSession) return null;

  const showButton = !NO_BUTTON_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  return (
    <>
      <LaryGuideView
        load={loadGuide}
        markSeen={markGuideSeen}
        canGo={canGo}
        menuName="Panel"
      />

      {showButton ? (
        <button
          type="button"
          onClick={openLaryGuide}
          data-guide="guide-button"
          aria-label="Ver la guía de Lary"
          title="Ver la guía de Lary"
          className="
            fixed bottom-[5.5rem] right-6 z-50 flex h-11 w-11 items-center
            justify-center rounded-full border border-white/15 bg-slate-800
            text-lg shadow-lg shadow-slate-950/50 transition
            hover:bg-slate-700 focus:outline-none focus-visible:ring-2
            focus-visible:ring-cyan-300
          "
        >
          📖
        </button>
      ) : null}
    </>
  );
}
