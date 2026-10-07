"use client";

import { useEffect, useState } from "react";

/**
 * Busca en la página lo que la guía quiere señalar.
 *
 * - `route:/my-fees` → el ítem del menú lateral con esa ruta (o el más
 *   parecido: la ruta guardada en el catálogo puede ser un prefijo).
 * - `text:Comprobantes por verificar` → la pestaña o el botón con ese texto.
 * - cualquier otra cosa → el elemento con ese `data-guide`.
 *
 * Solo cuenta lo visible: un ítem del menú escondido en el celular no se
 * puede señalar, y un anillo alrededor de la nada confunde más que no poner
 * ninguno.
 */
export function findGuideTarget(selector: string): HTMLElement | null {
  const visible = (el: Element | null): el is HTMLElement => {
    if (!(el instanceof HTMLElement)) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  };

  if (selector.startsWith("route:")) {
    const path = selector.slice("route:".length);
    const items = Array.from(
      document.querySelectorAll<HTMLElement>("[data-guide-route]"),
    ).filter(visible);

    const exact = items.find((el) => el.dataset.guideRoute === path);
    if (exact) return exact;

    // El más específico de los que son prefijo de la ruta, o la contienen.
    const near = items
      .filter((el) => {
        const route = el.dataset.guideRoute ?? "";
        return (
          route.length > 1 &&
          (path.startsWith(route + "/") || route.startsWith(path + "/"))
        );
      })
      .sort(
        (a, b) =>
          (b.dataset.guideRoute?.length ?? 0) -
          (a.dataset.guideRoute?.length ?? 0),
      );
    return near[0] ?? null;
  }

  if (selector.startsWith("text:")) {
    const text = selector.slice("text:".length).trim().toLowerCase();
    const candidates = Array.from(
      document.querySelectorAll<HTMLElement>(
        'button, a, [role="tab"], [role="button"], li, span, div',
      ),
    ).filter(
      (el) =>
        visible(el) &&
        // Lo de la propia guía no cuenta: sus instrucciones citan el texto.
        !el.closest("[data-lary-guide]") &&
        (el.textContent ?? "").trim().toLowerCase() === text,
    );

    // El más interno: el texto también está en todos sus contenedores.
    return (
      candidates.find(
        (el) => !candidates.some((other) => other !== el && el.contains(other)),
      ) ?? null
    );
  }

  const found = Array.from(
    document.querySelectorAll(`[data-guide="${CSS.escape(selector)}"]`),
  ).find(visible);
  return (found as HTMLElement | undefined) ?? null;
}

interface SpotlightProps {
  /** Qué señalar (ver `findGuideTarget`). null apaga el foco. */
  selector: string | null;
  /** Texto del globito junto al anillo. */
  label?: string;
  /** Avisa cuándo apareció (o no) el elemento, para que la guía hable de él. */
  onResolved?: (element: HTMLElement | null) => void;
}

/**
 * Anillo que señala un elemento real de la página, con un globito de Lary.
 *
 * No bloquea la página: el usuario puede tocar lo señalado, que es justo lo
 * que se le pide. Se vuelve a medir cada poco porque las pantallas cargan sus
 * datos después de pintarse y el botón se mueve.
 */
export default function LarySpotlight({
  selector,
  label,
  onResolved,
}: SpotlightProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    setRect(null);
    if (!selector) return;

    let element: HTMLElement | null = null;
    let scrolled = false;
    let reported = false;
    const startedAt = Date.now();

    const tick = () => {
      if (!element || !element.isConnected) {
        element = findGuideTarget(selector);
      }

      if (!element) {
        // Tras unos segundos sin aparecer se da por perdido: la pantalla no lo
        // tiene para este rol o este plan.
        if (!reported && Date.now() - startedAt > 4000) {
          reported = true;
          onResolved?.(null);
        }
        setRect(null);
        return;
      }

      if (!reported) {
        reported = true;
        onResolved?.(element);
      }

      if (!scrolled) {
        scrolled = true;
        element.scrollIntoView({ block: "center", behavior: "smooth" });
      }

      setRect(element.getBoundingClientRect());
    };

    tick();
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
    // `onResolved` cambia en cada render del padre; solo importa el selector.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selector]);

  if (!rect) return null;

  const pad = 6;
  const below = rect.bottom + 70 < window.innerHeight;

  return (
    <div className="pointer-events-none fixed inset-0 z-[10040]" aria-hidden="true">
      <div
        className="absolute rounded-xl border-2 border-cyan-400 shadow-[0_0_0_4px_rgba(34,211,238,0.25),0_0_30px_rgba(34,211,238,0.6)] transition-all duration-300"
        style={{
          top: rect.top - pad,
          left: rect.left - pad,
          width: rect.width + pad * 2,
          height: rect.height + pad * 2,
        }}
      >
        <span className="absolute inset-0 animate-ping rounded-xl border-2 border-cyan-300/60" />
      </div>

      {label ? (
        <div
          className="absolute max-w-[240px] rounded-xl bg-cyan-500 px-3 py-1.5 text-sm font-semibold text-slate-950 shadow-lg"
          style={{
            top: below ? rect.bottom + pad + 10 : rect.top - pad - 44,
            left: Math.min(
              Math.max(rect.left, 8),
              window.innerWidth - 248,
            ),
          }}
        >
          {below ? "👆 " : "👇 "}
          {label}
        </div>
      ) : null}
    </div>
  );
}
