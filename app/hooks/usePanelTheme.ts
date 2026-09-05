"use client";

import { useCallback, useEffect, useState } from "react";

export type PanelTheme = "dark" | "light";

export const PANEL_THEME_STORAGE_KEY = "panel-theme";

/**
 * El panel nació con el fondo oscuro quemado en el layout, y sobre él hay
 * mucho texto blanco: `colVariant="on"` de la librería y `text-white` a mano.
 * Este hook decide cuál de los dos temas está puesto; quién pinta qué lo
 * resuelve Tailwind con `darkMode: "class"` y la clase `dark` en el <html>.
 *
 * Oscuro es el valor por defecto a propósito: es lo que ve hoy todo el mundo, y
 * cambiárselo sin que lo pidan sería estrenar interfaz de un despliegue a otro.
 */
export function usePanelTheme() {
  // Se arranca en oscuro y no en lo que diga localStorage porque el servidor
  // renderiza sin acceso a él: leerlo en el primer render daría un HTML
  // distinto al del cliente y React tumbaría la hidratación. El valor real se
  // aplica en el efecto, y el script de `layout.tsx` ya puso la clase correcta
  // antes del primer pintado, así que no se ve el salto.
  const [theme, setTheme] = useState<PanelTheme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(PANEL_THEME_STORAGE_KEY);

    if (stored === "light" || stored === "dark") setTheme(stored);
    setMounted(true);
  }, []);

  const apply = useCallback((next: PanelTheme) => {
    setTheme(next);

    document.documentElement.classList.toggle("dark", next === "dark");

    try {
      window.localStorage.setItem(PANEL_THEME_STORAGE_KEY, next);
    } catch {
      // Modo incógnito o almacenamiento bloqueado: el tema funciona igual
      // durante la sesión, solo no se recuerda al volver.
    }
  }, []);

  const toggle = useCallback(
    () => apply(theme === "dark" ? "light" : "dark"),
    [apply, theme],
  );

  return { theme, isDark: theme === "dark", mounted, setTheme: apply, toggle };
}
