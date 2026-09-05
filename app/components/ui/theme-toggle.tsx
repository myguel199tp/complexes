"use client";

import React from "react";
import { FiMoon, FiSun } from "react-icons/fi";
import { Tooltip } from "complexes-next-components";

import { usePanelTheme } from "@/app/hooks/usePanelTheme";

/**
 * Cambia el panel entre el fondo oscuro de siempre y uno gris claro.
 *
 * Hasta que el hook lee `localStorage` se pinta el icono del tema oscuro, que
 * es el que el script del layout ya dejó aplicado: así el botón no cambia de
 * cara al hidratar.
 */
export default function ThemeToggle() {
  const { isDark, mounted, toggle } = usePanelTheme();

  const label = isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro";

  return (
    <Tooltip content={label} position="bottom" className="bg-gray-200">
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:bg-slate-900/40 dark:text-cyan-200 dark:hover:bg-slate-900/60"
      >
        {/* El icono anuncia a dónde vas, no dónde estás: en oscuro se ve el
            sol. Antes de montar se asume oscuro, que es lo que el script del
            layout ya dejó puesto si no hay nada guardado. */}
        {mounted && !isDark ? <FiMoon size={17} /> : <FiSun size={17} />}
      </button>
    </Tooltip>
  );
}
