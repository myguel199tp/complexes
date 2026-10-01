"use client";

import { useEffect } from "react";

import { getStoreAssistantSession } from "../services/comercioStoreService";

/** Lo que el widget del engine deja en la página y hay que retirar al salir. */
const WIDGET_SELECTORS = ".aiw-orb, .aiw-tab, .aiw-panel, #aiw-styles";

function removeWidget(script: HTMLScriptElement | null) {
  script?.remove();
  document.querySelectorAll(WIDGET_SELECTORS).forEach((node) => node.remove());
}

/**
 * El asistente de la tienda: la burbuja de chat del engine, con un pase que
 * emite ComplexPH para este residente.
 *
 * Con el pase, el asistente sabe quién pregunta y puede contestar "¿en qué va
 * mi pedido?" además de precios y disponibilidad. Si la tienda no tiene
 * asistente, no se pinta nada.
 *
 * No dibuja nada propio: inyecta el script del widget y lo retira al salir de
 * la ficha, para que la burbuja de una tienda no siga abierta en la siguiente.
 */
export function StoreAssistant({
  conjuntoId,
  branchId,
  businessName,
  logoUrl,
}: {
  conjuntoId: string;
  branchId: string;
  businessName?: string;
  logoUrl?: string | null;
}) {
  useEffect(() => {
    if (!conjuntoId || !branchId) return;

    // En desarrollo React monta dos veces: la primera ejecución no debe dejar
    // un widget huérfano cuando llegue su pase después de desmontarse.
    let cancelled = false;
    let script: HTMLScriptElement | null = null;

    getStoreAssistantSession(conjuntoId, branchId).then((session) => {
      if (cancelled || !session) return;

      // Por si quedó uno de otra tienda: el widget se configura al cargar y
      // no admite cambiar de pase en caliente.
      removeWidget(null);

      script = document.createElement("script");
      script.src = `${session.engineUrl}/widget/widget.js`;
      script.async = true;
      script.dataset.token = session.token;
      script.dataset.lang = "es";
      // En modo pase el widget no descarga la marca del negocio: se la damos.
      if (businessName) {
        script.dataset.name = businessName;
        script.dataset.welcome = `Hola 👋 Pregúntame por los productos de ${businessName} o por tus pedidos.`;
      }
      if (logoUrl) script.dataset.logo = logoUrl;

      document.body.appendChild(script);
    });

    return () => {
      cancelled = true;
      removeWidget(script);
    };
  }, [conjuntoId, branchId, businessName, logoUrl]);

  return null;
}
