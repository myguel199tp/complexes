"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { cn } from "./utils";

/**
 * Pestañas de la app. Reemplaza a `Tabs` de complexes-next-components con la
 * misma API base (`tabs`, `defaultActiveIndex`, `scrollable`).
 *
 * - `variant="underline"` (por defecto): línea bajo la pestaña activa.
 * - `variant="pills"`: control segmentado; la activa es una píldora blanca.
 *   Era la librería con `background` en cada pestaña.
 *
 * Las pestañas van en una sola fila que se desliza en horizontal cuando no
 * caben (en el móvil casi siempre), con un degradado en el borde que avisa
 * que hay más; `scrollable={false}` las hace saltar de línea.
 *
 * El indicador se desliza entre pestañas. Como la librería, solo se monta el
 * contenido de la pestaña activa (al volver a una se monta de nuevo y sus
 * queries se piden en ese momento); `keepMounted` las deja todas montadas.
 */

export interface TabItem {
  label?: ReactNode;
  /** Texto de la pestaña; si es una clave de i18n se traduce, si no se pinta tal cual. */
  tKey?: string;
  children: ReactNode;
  icon?: ReactNode;
  /** Contador o etiqueta corta al lado del texto (p. ej. pendientes). */
  badge?: ReactNode;
  disabled?: boolean;
}

export type TabsVariant = "underline" | "pills";
export type TabsSize = "sm" | "md" | "lg";

export interface TabsProps {
  tabs: TabItem[];
  defaultActiveIndex?: number;
  /** Modo controlado: el padre decide la pestaña activa. */
  activeIndex?: number;
  onChange?: (index: number) => void;
  variant?: TabsVariant;
  size?: TabsSize;
  /** Una sola fila con desplazamiento horizontal (por defecto). `false` = saltar de línea. */
  scrollable?: boolean;
  /** Las pestañas se reparten todo el ancho. */
  fullWidth?: boolean;
  keepMounted?: boolean;
  className?: string;
  listClassName?: string;
  panelClassName?: string;
}

type Box = { left: number; top: number; width: number; height: number };
type Edges = { left: boolean; right: boolean };

// useLayoutEffect avisa en el render del servidor; allí no hay nada que medir
const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const FADE = 28;

const sizeMap: Record<TabsSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

// El riel es el contenedor exterior; dentro va la fila que se desliza, así el
// degradado de los bordes atenúa las pestañas y no el riel.
const railClass: Record<TabsVariant, string> = {
  pills: "rounded-2xl bg-slate-100 p-1 ring-1 ring-inset ring-slate-200/80",
  underline: "w-full border-b border-slate-400/25",
};

const tabBase: Record<TabsVariant, string> = {
  pills: "rounded-xl",
  underline: "rounded-t-lg hover:bg-slate-500/10",
};

const tabState: Record<TabsVariant, { on: string; off: string }> = {
  pills: {
    on: "text-cyan-700",
    off: "text-slate-500 hover:text-slate-800",
  },
  // Sin fondo propio: tonos medios que se leen en el panel oscuro y en los
  // modales blancos
  underline: {
    on: "text-cyan-600",
    off: "text-slate-500 hover:text-cyan-600",
  },
};

const badgeState = {
  on: "bg-cyan-600 text-white",
  off: "bg-slate-200 text-slate-600",
};

function fadeMask({ left, right }: Edges): CSSProperties | undefined {
  if (!left && !right) return undefined;
  const mask = `linear-gradient(to right, ${left ? "transparent" : "#000"} 0, #000 ${FADE}px, #000 calc(100% - ${FADE}px), ${right ? "transparent" : "#000"} 100%)`;
  return { maskImage: mask, WebkitMaskImage: mask };
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      tabs,
      defaultActiveIndex = 0,
      activeIndex,
      onChange,
      variant = "underline",
      size = "md",
      scrollable = true,
      fullWidth = false,
      keepMounted = false,
      className,
      listClassName,
      panelClassName,
    },
    ref,
  ) => {
    const { t, i18n } = useTranslation();
    const baseId = useId();

    const isControlled = activeIndex !== undefined;
    const [innerIndex, setInnerIndex] = useState(defaultActiveIndex);
    // Las pestañas condicionales pueden desaparecer: nunca apuntar fuera
    const current = Math.max(
      0,
      Math.min(isControlled ? activeIndex : innerIndex, tabs.length - 1),
    );

    const listRef = useRef<HTMLDivElement>(null);
    const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
    const [box, setBox] = useState<Box | null>(null);
    const [edges, setEdges] = useState<Edges>({ left: false, right: false });
    // La primera medida se pinta sin transición para que no "vuele" desde 0
    const [animate, setAnimate] = useState(false);

    const updateEdges = useCallback(() => {
      const list = listRef.current;
      if (!list || !scrollable) return;
      const max = list.scrollWidth - list.clientWidth;
      const left = list.scrollLeft > 2;
      const right = list.scrollLeft < max - 2;
      setEdges((prev) =>
        prev.left === left && prev.right === right ? prev : { left, right },
      );
    }, [scrollable]);

    const measure = useCallback(() => {
      const el = tabRefs.current[current];
      if (!el) {
        setBox(null);
      } else {
        setBox({
          left: el.offsetLeft,
          top: el.offsetTop,
          width: el.offsetWidth,
          height: el.offsetHeight,
        });
      }
      updateEdges();
    }, [current, updateEdges]);

    useIsoLayoutEffect(() => {
      measure();
    }, [measure, tabs.length, i18n.language]);

    useEffect(() => {
      if (!box || animate) return;
      const id = requestAnimationFrame(() => setAnimate(true));
      return () => cancelAnimationFrame(id);
    }, [box, animate]);

    // Cambios de ancho (ventana, fuentes, traducciones) mueven las pestañas
    useEffect(() => {
      const list = listRef.current;
      if (!list || typeof ResizeObserver === "undefined") return;
      const ro = new ResizeObserver(() => measure());
      ro.observe(list);
      tabRefs.current.forEach((el) => el && ro.observe(el));
      return () => ro.disconnect();
    }, [measure, tabs.length]);

    // En la fila desplazable, la pestaña activa queda a la vista: al montar
    // de golpe (si arranca lejos) y luego con animación
    const scrolledOnce = useRef(false);
    useEffect(() => {
      if (!scrollable) return;
      const list = listRef.current;
      const el = tabRefs.current[current];
      if (!list || !el || list.scrollWidth <= list.clientWidth) return;
      const target = el.offsetLeft - (list.clientWidth - el.offsetWidth) / 2;
      list.scrollTo({
        left: Math.max(0, target),
        behavior: scrolledOnce.current ? "smooth" : "auto",
      });
      scrolledOnce.current = true;
    }, [current, scrollable]);

    const select = (index: number) => {
      if (index === current || tabs[index]?.disabled) return;
      if (!isControlled) setInnerIndex(index);
      onChange?.(index);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      const enabled = tabs
        .map((tab, i) => (tab.disabled ? -1 : i))
        .filter((i) => i >= 0);
      if (!enabled.length) return;
      const pos = enabled.indexOf(current);
      let next: number | undefined;
      if (e.key === "ArrowRight") next = enabled[(pos + 1) % enabled.length];
      else if (e.key === "ArrowLeft")
        next = enabled[(pos - 1 + enabled.length) % enabled.length];
      else if (e.key === "Home") next = enabled[0];
      else if (e.key === "End") next = enabled[enabled.length - 1];
      if (next === undefined) return;
      e.preventDefault();
      select(next);
      tabRefs.current[next]?.focus();
    };

    const labelOf = (tab: TabItem) =>
      tab.tKey ? (i18n.exists(tab.tKey) ? t(tab.tKey) : tab.tKey) : tab.label;

    if (!tabs.length) return null;

    // Una sola pestaña sin texto es solo un contenedor: no hay barra que mostrar
    const showList = tabs.some((tab) => tab.label || tab.tKey || tab.icon);

    const panels = keepMounted
      ? tabs.map((tab, i) => ({ tab, i }))
      : [{ tab: tabs[current], i: current }];

    return (
      <div ref={ref} className={cn("w-full", className)}>
        {showList && (
          <div
            className={cn(
              "max-w-full",
              variant === "pills" && (fullWidth ? "w-full" : "w-fit"),
              railClass[variant],
            )}
          >
            <div
              ref={listRef}
              role="tablist"
              aria-orientation="horizontal"
              onKeyDown={handleKeyDown}
              onScroll={updateEdges}
              style={scrollable ? fadeMask(edges) : undefined}
              className={cn(
                "relative flex gap-1",
                scrollable
                  ? "flex-nowrap overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  : "flex-wrap",
                listClassName,
              )}
            >
              {box && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute z-0",
                    variant === "pills"
                      ? "rounded-xl bg-white shadow-sm shadow-slate-900/10 ring-1 ring-slate-900/5"
                      : "rounded-full bg-cyan-600",
                    animate &&
                      "transition-[left,top,width,height] duration-300 ease-out",
                  )}
                  style={
                    variant === "pills"
                      ? box
                      : {
                          left: box.left,
                          width: box.width,
                          top: box.top + box.height - 2,
                          height: 2,
                        }
                  }
                />
              )}

              {tabs.map((tab, i) => {
                const active = i === current;
                return (
                  <button
                    key={i}
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`${baseId}-tab-${i}`}
                    aria-selected={active}
                    aria-controls={`${baseId}-panel-${i}`}
                    tabIndex={active ? 0 : -1}
                    disabled={tab.disabled}
                    onClick={() => select(i)}
                    className={cn(
                      "relative z-10 inline-flex items-center justify-center gap-2 font-semibold leading-tight",
                      "transition-colors duration-200 outline-none",
                      "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cyan-500",
                      "disabled:cursor-not-allowed disabled:opacity-40",
                      sizeMap[size],
                      tabBase[variant],
                      active ? tabState[variant].on : tabState[variant].off,
                      scrollable && "shrink-0 whitespace-nowrap",
                      fullWidth && "flex-1 whitespace-nowrap",
                    )}
                  >
                    {tab.icon && (
                      <span className="shrink-0 text-[1.1em]">{tab.icon}</span>
                    )}
                    {labelOf(tab)}
                    {tab.badge !== undefined && tab.badge !== null && (
                      <span
                        className={cn(
                          "min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-[10px] font-bold leading-none transition-colors",
                          active ? badgeState.on : badgeState.off,
                        )}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {panels.map(({ tab, i }) => (
          <div
            key={keepMounted ? i : `active-${i}`}
            role={showList ? "tabpanel" : undefined}
            id={`${baseId}-panel-${i}`}
            aria-labelledby={showList ? `${baseId}-tab-${i}` : undefined}
            hidden={i !== current}
            className={cn(showList && "mt-4", "w-full", panelClassName)}
          >
            {tab?.children}
          </div>
        ))}
      </div>
    );
  },
);

Tabs.displayName = "Tabs";
