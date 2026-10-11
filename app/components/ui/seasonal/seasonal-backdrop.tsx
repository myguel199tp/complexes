"use client";

import SeasonalParticles from "./seasonal-particles";
import type { SeasonalTheme } from "./seasonal-theme";

/**
 * Fondo de las pantallas de inicio de sesión: los dos resplandores de siempre
 * y, si hay temporada, teñidos con sus colores, con los adornos cayendo y un
 * emoji grande de marca de agua. Sin temporada se ve exactamente igual que
 * antes, por eso los resplandores viven aquí y no en cada pantalla.
 */
export default function SeasonalBackdrop({
  theme,
}: {
  theme: SeasonalTheme | null;
}) {
  return (
    <>
      <div
        className="pointer-events-none absolute top-[-200px] left-[-200px] h-[500px] w-[500px] rounded-full bg-cyan-500/20 blur-[140px] transition-colors duration-1000"
        style={theme ? { backgroundColor: theme.colors.glowA } : undefined}
      />
      <div
        className="pointer-events-none absolute bottom-[-200px] right-[-200px] h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-[140px] transition-colors duration-1000"
        style={theme ? { backgroundColor: theme.colors.glowB } : undefined}
      />

      {theme && (
        <>
          <SeasonalParticles theme={theme} />
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-4 left-4 select-none text-[7rem] leading-none opacity-[0.12] sm:text-[10rem]"
          >
            {theme.emoji}
          </span>
        </>
      )}
    </>
  );
}
