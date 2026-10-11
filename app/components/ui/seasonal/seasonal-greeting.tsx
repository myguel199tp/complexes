"use client";

import type { SeasonalTheme } from "./seasonal-theme";

/**
 * Saludo de temporada para la tarjeta de inicio de sesión. Sin temporada no
 * pinta nada, para no dejar un hueco en el formulario.
 */
export default function SeasonalGreeting({
  theme,
  className = "",
}: {
  theme: SeasonalTheme | null;
  className?: string;
}) {
  if (!theme) return null;

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-white shadow-lg ${className}`}
      style={{
        backgroundImage: `linear-gradient(135deg, ${theme.colors.from}, ${theme.colors.to})`,
      }}
    >
      <span aria-hidden className="season-wiggle text-3xl leading-none">
        {theme.emoji}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-extrabold leading-tight">{theme.greeting}</p>
        <p className="mt-0.5 text-xs leading-snug text-white/90">
          {theme.message}
        </p>
      </div>
    </div>
  );
}
