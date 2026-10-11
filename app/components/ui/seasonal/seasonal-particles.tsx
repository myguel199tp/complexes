"use client";

import { useMemo } from "react";
import type { SeasonalTheme } from "./seasonal-theme";

/**
 * Pseudoaleatorio estable por índice: las posiciones no pueden cambiar en cada
 * render, o los adornos saltarían de lugar cada vez que la página se actualiza.
 */
const seeded = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

interface SeasonalParticlesProps {
  theme: SeasonalTheme;
  count?: number;
  /**
   * "screen" cruza toda la pantalla cayendo o subiendo según la temporada;
   * "float" deja los adornos flotando en su sitio, para cajas pequeñas como un
   * banner, donde una caída de pantalla completa no se alcanzaría a ver.
   */
  variant?: "screen" | "float";
  className?: string;
}

/**
 * Adornos animados de la temporada. Son decorativos: no reciben clics ni los
 * leen los lectores de pantalla, y con "reducir movimiento" no se pintan (la
 * regla vive en globals.css, junto a las animaciones).
 */
export default function SeasonalParticles({
  theme,
  count = 14,
  variant = "screen",
  className = "",
}: SeasonalParticlesProps) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        emoji: theme.particles[i % theme.particles.length],
        left: Math.round(seeded(i, 1) * 96),
        top: Math.round(seeded(i, 5) * 80),
        size: 14 + Math.round(seeded(i, 2) * 18),
        duration: variant === "screen" ? 9 + seeded(i, 3) * 9 : 3 + seeded(i, 3) * 3,
        delay: -seeded(i, 4) * 18,
        drift: Math.round((seeded(i, 6) - 0.5) * 120),
        spin: Math.round((seeded(i, 7) - 0.5) * 360),
        opacity: variant === "screen" ? 0.35 + seeded(i, 8) * 0.4 : 0.9,
      })),
    [theme, count, variant],
  );

  const animation =
    variant === "float"
      ? "season-bob"
      : theme.motion === "rise"
        ? "season-rise"
        : "season-fall";
  const easing = variant === "float" ? "ease-in-out" : "linear";

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 select-none overflow-hidden ${className}`}
    >
      {particles.map((p, i) => (
        <span
          key={i}
          className="season-particle absolute"
          style={
            {
              left: `${p.left}%`,
              top: variant === "float" ? `${p.top}%` : 0,
              fontSize: p.size,
              opacity: p.opacity,
              animation: `${animation} ${p.duration}s ${easing} ${p.delay}s infinite`,
              "--season-drift": `${p.drift}px`,
              "--season-spin": `${p.spin}deg`,
            } as React.CSSProperties
          }
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
