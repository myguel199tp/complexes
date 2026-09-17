"use client";

import { useEffect, useState } from "react";
import { showcaseService } from "./showcase-service";
import { ShowcaseCampaign } from "./types";

/**
 * El país está fijo mientras sólo se opere Colombia, igual que en el cotizador
 * de `/registers/complex`.
 */
const COUNTRY = "CO";

/**
 * Promociones vigentes para anunciar. Lo usan el banner y el formulario de
 * demostración, que necesitan la misma lista: uno para anunciarla y otro para
 * ofrecer aplicar a ella.
 *
 * No expone estado de carga a propósito: sin campaña no se debe pintar nada, y
 * un esqueleto que casi siempre desaparece mueve el diseño de la página.
 */
export function useShowcase() {
  const [campaigns, setCampaigns] = useState<ShowcaseCampaign[]>([]);

  useEffect(() => {
    let cancelled = false;

    showcaseService(COUNTRY)
      .then((result) => {
        if (!cancelled) setCampaigns(result.campaigns ?? []);
      })
      // Una promoción que no carga no puede tumbar la página: simplemente no
      // se anuncia.
      .catch(() => {
        if (!cancelled) setCampaigns([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { campaigns };
}
