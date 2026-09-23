"use client";

/**
 * Recordatorio flotante de la perspectiva activa.
 *
 * El mapa está arriba y lo que cambia al elegir un actor queda más abajo:
 * sin esta barra, quien baja por la página no sabe por qué el texto le habla
 * a "tu negocio" ni cómo volver a la portada general. Solo aparece mientras
 * hay un actor elegido.
 */

import { useEcosystemPerspective } from "../../soluciones/ecosistemas/_components/ecosystem-perspective";

export default function PerspectiveBar() {
  const { actor, setActivo } = useEcosystemPerspective();
  if (!actor) return null;

  const Icono = actor.icon;

  const irAlMapa = () => {
    document
      .getElementById("ecosystem-home-title")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div
      role="status"
      className="fixed bottom-4 left-4 z-40 flex max-w-[calc(100vw-6rem)] items-center gap-3 rounded-full border border-white/15 bg-slate-950/90 py-2 pl-4 pr-2 text-sm text-white shadow-[0_20px_50px_rgba(0,0,0,.45)] backdrop-blur-xl sm:left-1/2 sm:-translate-x-1/2"
    >
      <Icono className={`shrink-0 ${actor.accent.text}`} />
      <span className="truncate">
        Viendo como{" "}
        <span className={`font-semibold ${actor.accent.text}`}>
          {actor.nombre}
        </span>
      </span>
      <button
        type="button"
        onClick={irAlMapa}
        className="hidden shrink-0 rounded-full px-3 py-1 text-xs font-semibold text-slate-300 transition-colors hover:bg-white/10 hover:text-white sm:block"
      >
        Cambiar
      </button>
      <button
        type="button"
        onClick={() => setActivo(null)}
        className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold transition-colors hover:bg-white/20"
      >
        Ver todo
      </button>
    </div>
  );
}
