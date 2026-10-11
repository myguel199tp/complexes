"use client";

import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import SeasonalParticles from "./seasonal-particles";
import { seasonDismissKey, type SeasonAudience } from "./seasonal-theme";
import { useSeasonalTheme } from "./use-seasonal-theme";

/**
 * Banda de temporada para la pantalla principal (Halloween, Navidad...).
 *
 * Se puede cerrar y queda cerrada hasta la temporada siguiente: es un saludo,
 * y repetirlo en cada visita lo vuelve ruido. Mientras no se sabe si ya se
 * cerró no pinta nada, para que no aparezca un instante y desaparezca.
 */
export default function SeasonalBanner({
  audience = "comunidad",
  className = "px-2 pt-2 sm:px-3 md:px-4 xl:px-6",
}: {
  audience?: SeasonAudience;
  /**
   * Márgenes del contenedor. El valor por defecto es el de la portada, igual
   * al de PromoBanner; cada pantalla que lo hospede pasa el suyo.
   */
  className?: string;
}) {
  const theme = useSeasonalTheme(audience);
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!theme) return;
    try {
      setDismissed(localStorage.getItem(seasonDismissKey(theme)) === "1");
    } catch {
      setDismissed(false);
    }
  }, [theme]);

  if (!theme || dismissed !== false) return null;

  const close = () => {
    setDismissed(true);
    try {
      localStorage.setItem(seasonDismissKey(theme), "1");
    } catch {
      // Sin almacenamiento se cierra solo por esta visita.
    }
  };

  return (
    <div className={className}>
      <div
        className="relative mx-auto w-full max-w-[1400px] overflow-hidden rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,.18)]"
        style={{
          backgroundImage: `linear-gradient(110deg, ${theme.colors.from}, ${theme.colors.to})`,
        }}
      >
        {/* Los adornos solo en la mitad derecha, para no pasar por debajo
            del texto en pantallas anchas. */}
        <div className="absolute inset-y-0 right-0 hidden w-1/2 sm:block">
          <SeasonalParticles theme={theme} count={9} variant="float" />
        </div>

        <div className="relative flex items-center gap-4 px-5 py-4 pr-12 md:px-7">
          <span aria-hidden className="season-wiggle text-4xl leading-none md:text-5xl">
            {theme.emoji}
          </span>
          <div className="min-w-0 text-white">
            <p className="text-lg font-extrabold leading-tight md:text-xl">
              {theme.greeting}
            </p>
            <p className="mt-0.5 max-w-2xl text-sm text-white/90">
              {theme.message}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={close}
          aria-label="Cerrar saludo de temporada"
          className="absolute right-3 top-3 rounded-full bg-black/20 p-1.5 text-white transition hover:bg-black/35"
        >
          <IoClose size={16} />
        </button>
      </div>
    </div>
  );
}
