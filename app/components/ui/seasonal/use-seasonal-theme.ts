"use client";

import { useEffect, useState } from "react";
import {
  resolveSeasonalTheme,
  type SeasonAudience,
  type SeasonalTheme,
} from "./seasonal-theme";

/**
 * Temporada vigente para la fecha del visitante.
 *
 * Se resuelve en un efecto y no durante el render: la página se pinta primero
 * en el servidor, que puede tener otra fecha u otra zona horaria, y calcularla
 * ahí produciría un desajuste de hidratación justo el día que cambia.
 *
 * Para revisar una temporada sin esperar a la fecha basta con `?tema=navidad`
 * en la URL; `NEXT_PUBLIC_SEASON_OVERRIDE=off` la apaga en todo el sitio.
 */
export function useSeasonalTheme(
  audience: SeasonAudience = "comunidad",
): SeasonalTheme | null {
  const [theme, setTheme] = useState<SeasonalTheme | null>(null);

  useEffect(() => {
    let override = process.env.NEXT_PUBLIC_SEASON_OVERRIDE ?? null;
    try {
      override = new URLSearchParams(window.location.search).get("tema") ?? override;
    } catch {
      // Sin acceso a la URL manda la fecha.
    }
    setTheme(resolveSeasonalTheme(new Date(), { audience, override }));
  }, [audience]);

  return theme;
}
