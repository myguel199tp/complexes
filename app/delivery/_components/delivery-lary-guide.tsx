"use client";

import { usePathname } from "next/navigation";

import LaryGuideView, {
  openLaryGuide,
} from "@/app/components/lary-guide/lary-guide-view";
import type { AssistantGuideState } from "@/app/(panel)/my-new-user/services/assistantGuideService";
import { deliveryFetch } from "../_lib/delivery-api";

/**
 * Las pantallas de trabajo del domiciliario. En login y activación no hay
 * sesión (pedir la guía daría 401 y mandaría al login a mitad del formulario),
 * y en la identificación tiene que terminar primero lo que está haciendo.
 */
const GUIDE_PREFIXES = ["/delivery/orders", "/delivery/runs"];

function loadGuide() {
  return deliveryFetch<AssistantGuideState>(
    "/assistant-guide/delivery?platform=web",
  );
}

function markGuideSeen(guideId: string) {
  // Si falla, la guía vuelve a salir en el próximo ingreso y ya.
  deliveryFetch<void>("/assistant-guide/delivery/seen", {
    method: "POST",
    body: JSON.stringify({ guideId }),
  }).catch(() => undefined);
}

/** Todo lo de su guía lo puede abrir: el domiciliario no tiene plan ni roles. */
const canGo = () => true;

/**
 * 📖 Guía de Lary del domiciliario en el panel web. Es la misma de la app y
 * comparte el "ya la vio": quien la vio en el celular no la recibe otra vez.
 */
export default function DeliveryLaryGuide() {
  const pathname = usePathname() ?? "";

  if (!GUIDE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return null;
  }

  return (
    <>
      <LaryGuideView
        load={loadGuide}
        markSeen={markGuideSeen}
        canGo={canGo}
        menuName="Mis entregas"
      />

      <button
        type="button"
        onClick={openLaryGuide}
        data-guide="guide-button"
        aria-label="Ver la guía de Lary"
        title="Ver la guía de Lary"
        className="
          fixed bottom-6 right-6 z-50 flex h-11 w-11 items-center
          justify-center rounded-full border border-white/15 bg-slate-800
          text-lg shadow-lg shadow-slate-950/50 transition
          hover:bg-slate-700 focus:outline-none focus-visible:ring-2
          focus-visible:ring-cyan-300
        "
      >
        📖
      </button>
    </>
  );
}
