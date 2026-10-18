"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { B2bNav } from "./b2b-nav";

/**
 * Piezas visuales del módulo de Comercios Aliados.
 *
 * El panel tiene tema claro y oscuro, y las pantallas B2B nacieron solo para
 * el oscuro: en el claro los títulos blancos desaparecían sobre el fondo gris.
 * Todo color de este módulo sale de aquí, con su par `dark:`, siguiendo el
 * mismo lenguaje del resto del panel (tarjeta blanca con borde suave en
 * claro, translúcida en oscuro).
 *
 * Los modales de la librería son siempre blancos, en los dos temas: lo que va
 * dentro de un modal usa `modal.*`, sin variantes oscuras.
 */

export const ui = {
  title: "text-slate-900 dark:text-white",
  strong: "text-slate-900 dark:text-slate-100",
  text: "text-slate-700 dark:text-slate-300",
  muted: "text-slate-600 dark:text-slate-400",
  faint: "text-slate-500 dark:text-slate-500",
  card: "rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none",
  subtle:
    "rounded-xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.03]",
  divider: "border-slate-200 dark:border-white/10",
  input:
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 dark:border-white/15 dark:bg-white/[0.06] dark:text-slate-100 dark:placeholder:text-slate-500",
  label: "mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400",
  link: "font-semibold text-cyan-700 underline-offset-2 hover:underline dark:text-cyan-300",
};

/** Dentro de un modal (siempre blanco). */
export const modal = {
  text: "text-sm text-slate-600",
  strong: "text-slate-900",
  muted: "text-xs text-slate-500",
  box: "rounded-xl border border-slate-200 bg-slate-50 p-3",
  input:
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30",
  label: "mb-1 block text-xs font-medium text-slate-600",
};

export type Tone = "neutral" | "info" | "success" | "warning" | "danger" | "accent";

const PILL: Record<Tone, string> = {
  neutral:
    "border-slate-200 bg-slate-100 text-slate-700 dark:border-white/10 dark:bg-white/[0.06] dark:text-slate-300",
  info: "border-cyan-500/30 bg-cyan-500/10 text-cyan-800 dark:text-cyan-200",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
  warning: "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200",
  danger: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
  accent: "border-cyan-500/30 bg-cyan-500/10 text-cyan-800 dark:text-cyan-200",
};

const DOT: Record<Tone, string> = {
  neutral: "bg-slate-400",
  info: "bg-cyan-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  accent: "bg-cyan-500",
};

/** Etiqueta de estado: un punto de color y el texto. */
export function Pill({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${PILL[tone]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[tone]}`} />
      {children}
    </span>
  );
}

const CALLOUT: Record<Tone, string> = {
  neutral: "border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300",
  info: "border-cyan-500/30 bg-cyan-500/10 text-cyan-900 dark:text-cyan-100",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100",
  warning: "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-100",
  danger: "border-red-500/30 bg-red-500/10 text-red-800 dark:text-red-200",
  accent: "border-cyan-500/30 bg-cyan-500/10 text-cyan-900 dark:text-cyan-100",
};

/** Aviso dentro de una tarjeta o de la página: qué pasa y qué hacer. */
export function Callout({
  tone = "info",
  title,
  children,
  action,
}: {
  tone?: Tone;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className={`rounded-xl border px-3 py-2.5 text-sm ${CALLOUT[tone]}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {title ? <p className="font-semibold">{title}</p> : null}
          {children ? (
            <div className={title ? "mt-0.5 text-[13px] opacity-90" : "text-[13px]"}>
              {children}
            </div>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}

/** Encabezado de cada pantalla del módulo, con la barra de pasos. */
export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header>
      {back ? (
        <Link href={back.href} className={`text-sm ${ui.link}`}>
          ← {back.label}
        </Link>
      ) : null}
      <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 max-w-3xl">
          <h1 className={`text-xl font-bold sm:text-2xl ${ui.title}`}>{title}</h1>
          {description ? (
            <p className={`mt-1 text-sm ${ui.muted}`}>{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
      <B2bNav />
    </header>
  );
}

/** Título de una sección dentro de la página. */
export function SectionTitle({
  title,
  description,
  right,
}: {
  title: ReactNode;
  description?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div className="min-w-0">
        <h2 className={`text-base font-bold ${ui.title}`}>{title}</h2>
        {description ? <p className={`text-sm ${ui.muted}`}>{description}</p> : null}
      </div>
      {right}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center dark:border-white/15">
      {icon ? (
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-2xl text-cyan-700 dark:text-cyan-300">
          {icon}
        </div>
      ) : null}
      <p className={`font-semibold ${ui.strong}`}>{title}</p>
      {children ? (
        <p className={`mx-auto mt-1 max-w-md text-sm ${ui.muted}`}>{children}</p>
      ) : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

/** Esqueleto mientras carga: mantiene el lugar en vez de un "Cargando..." suelto. */
export function LoadingCards({ count = 3 }: { count?: number }) {
  return (
    <div className="mt-6 grid gap-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`${ui.card} animate-pulse p-5`}>
          <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-white/10" />
          <div className="mt-3 h-3 w-2/3 rounded bg-slate-200 dark:bg-white/10" />
          <div className="mt-2 h-3 w-1/2 rounded bg-slate-200 dark:bg-white/10" />
        </div>
      ))}
    </div>
  );
}

/** Cifra destacada (lo que se debe, cuánto falta). */
export function Stat({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  tone?: Tone;
}) {
  const valueColor: Record<Tone, string> = {
    neutral: ui.strong,
    info: "text-cyan-700 dark:text-cyan-300",
    success: "text-emerald-700 dark:text-emerald-300",
    warning: "text-amber-700 dark:text-amber-300",
    danger: "text-red-700 dark:text-red-300",
    accent: "text-cyan-700 dark:text-cyan-300",
  };

  return (
    <div className={`${ui.card} min-w-0 p-4`}>
      <span className={`block text-xs ${ui.muted}`}>{label}</span>
      <span className={`mt-1 block text-2xl font-bold ${valueColor[tone]}`}>{value}</span>
      {hint ? <span className={`mt-0.5 block text-xs ${ui.faint}`}>{hint}</span> : null}
    </div>
  );
}

/** Dato con su etiqueta, para las fichas de cada tarjeta. */
export function Fact({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <span className={`block text-[11px] uppercase tracking-wide ${ui.faint}`}>{label}</span>
      <span className={`block text-sm font-medium ${ui.strong}`}>{children}</span>
    </div>
  );
}

// ─── Formato ───

export function fmtMoney(value: number | string | null | undefined, currency = "COP") {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: currency || "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(isNaN(n) ? 0 : n);
}

export function fmtDate(value?: string | Date | null, long = false) {
  if (!value) return "";
  return new Date(value).toLocaleDateString(
    "es-CO",
    long ? { day: "numeric", month: "long", year: "numeric" } : undefined,
  );
}

export const PERIOD_SHORT: Record<string, string> = {
  mensual: "mes",
  semestral: "semestre",
  anual: "año",
};
