"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { fileUrl } from "@/app/helpers/fileUrl";
import type {
  B2bBillingPeriod,
  B2bComercio,
  B2bPricingModel,
} from "../services/b2bAllianceService";
import { DEMAND_CATEGORY_LABELS } from "../services/b2bDemandService";
import { StarRating } from "./star-rating";

function resolveLogo(logoUrl?: string): string | null {
  if (!logoUrl) return null;
  if (/^https?:\/\//i.test(logoUrl)) return logoUrl;
  return fileUrl(logoUrl);
}

const PERIOD_SUFFIX: Record<B2bBillingPeriod, string> = {
  mensual: "/mes",
  semestral: "/semestre",
  anual: "/año",
};

const MODEL_LABEL: Record<B2bPricingModel, string> = {
  fijo: "precio fijo",
  por_apartamento: "por apartamento",
};

/**
 * Color estable a partir del nombre, para el aliado que no subió logo.
 *
 * Derivarlo del nombre —y no al azar— hace que cada empresa conserve su color
 * entre recargas, que es lo que permite reconocerla de un vistazo.
 */
const COVERS = [
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-fuchsia-500 to-purple-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-indigo-500 to-violet-600",
];

function coverFor(name: string): string {
  let hash = 0;

  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % 997;
  }

  return COVERS[hash % COVERS.length];
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

const money = (value: number, currency: string) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: currency || "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

/** Cuántos servicios se listan antes de resumir el resto en un "+N". */
const VISIBLE_CATEGORIES = 3;

export function AllyCard({
  comercio,
  category,
}: {
  comercio: B2bComercio;
  /**
   * El servicio con el que se llegó al directorio. Viaja al detalle para que el
   * catálogo aterrice ya filtrado por lo que la persona vino a resolver.
   */
  category?: string;
}) {
  const logo = resolveLogo(comercio.logoUrl);
  const cover = coverFor(comercio.businessName);

  const categories = comercio.categories ?? [];
  const visibleCategories = categories.slice(0, VISIBLE_CATEGORIES);
  const hiddenCategories = categories.length - visibleCategories.length;

  const planCount = comercio.planCount ?? 0;
  const activeClients = comercio.activeClients ?? 0;
  const fromPrice = comercio.fromPrice ?? null;

  return (
    <Link
      href={
        category
          ? `/my-b2b/${comercio.id}?category=${category}`
          : `/my-b2b/${comercio.id}`
      }
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-cyan-400 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-cyan-400/40 dark:hover:bg-white/[0.08]"
    >
      <div className="flex items-start gap-3">
        {/*
          Caja fija con fondo blanco: los logos vienen en PNG con transparencia
          y pensados para papel, así que sobre el panel oscuro se perdían los
          trazos negros. Antes ocupaban una franja de 96px que empujaba el
          nombre y el precio fuera del primer vistazo.
        */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/10">
          {logo ? (
            <img
              src={logo}
              alt={comercio.businessName}
              className="h-full w-full object-contain p-1"
            />
          ) : (
            <span
              className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${cover} text-lg font-bold text-white`}
            >
              {initials(comercio.businessName)}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {comercio.businessName}
            </span>

            {comercio.verified ? (
              <span
                title="Soportes obligatorios al día y revisados"
                className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-700 dark:text-emerald-300"
              >
                ✓ verificado
              </span>
            ) : null}
          </div>

          <div className="mt-1">
            <StarRating
              value={comercio.ratingAverage}
              count={comercio.ratingCount}
            />
          </div>

          {comercio.city ? (
            <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
              📍 {comercio.city}
              {comercio.country ? `, ${comercio.country}` : ""}
            </span>
          ) : null}
        </div>
      </div>

      {comercio.description ? (
        <p className="mt-3 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
          {comercio.description}
        </p>
      ) : null}

      {visibleCategories.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1">
          {visibleCategories.map((cat) => (
            <span
              key={cat}
              className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[10px] text-cyan-700 dark:text-cyan-300"
            >
              {DEMAND_CATEGORY_LABELS[cat] ?? cat}
            </span>
          ))}

          {hiddenCategories > 0 ? (
            <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[10px] text-slate-500 dark:border-white/10 dark:text-slate-400">
              +{hiddenCategories}
            </span>
          ) : null}
        </div>
      ) : null}

      {/*
        Lo que decide si vale la pena abrir la ficha: desde cuánto cobra y a
        cuántos conjuntos les presta servicio hoy. El directorio mostraba
        nombre, ciudad y estrellas, y para saber el precio había que entrar a
        cada aliado uno por uno.
      */}
      <div className="mt-4 flex flex-wrap items-end justify-between gap-2 border-t border-slate-200 pt-3 dark:border-white/10">
        <div className="min-w-0">
          {fromPrice !== null ? (
            <>
              <span className="block text-[10px] uppercase tracking-wide text-slate-400">
                Planes desde
              </span>

              <span className="block truncate font-semibold text-slate-900 dark:text-slate-100">
                {money(fromPrice, comercio.fromPriceCurrency ?? "COP")}
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                  {comercio.fromPriceBillingPeriod
                    ? PERIOD_SUFFIX[comercio.fromPriceBillingPeriod]
                    : ""}
                  {comercio.fromPricePricingModel
                    ? ` · ${MODEL_LABEL[comercio.fromPricePricingModel]}`
                    : ""}
                </span>
              </span>
            </>
          ) : (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {planCount > 0
                ? `${planCount} plan${planCount > 1 ? "es" : ""} publicado${
                    planCount > 1 ? "s" : ""
                  }`
                : "Todavía no publica planes"}
            </span>
          )}

          {/*
            Prueba social: las estrellas dependen de que alguien se siente a
            calificar; un contrato activo es un conjunto que ya decidió trabajar
            con esa empresa y sigue haciéndolo.
          */}
          {activeClients > 0 ? (
            <span className="mt-1 block text-[11px] text-slate-500 dark:text-slate-400">
              🏢 {activeClients} conjunto{activeClients > 1 ? "s" : ""} lo tiene
              {activeClients > 1 ? "n" : ""} contratado
            </span>
          ) : null}
        </div>

        {/* La llamada a la acción que no había: la tarjeta era un bloque de
            datos sin nada que dijera qué pasa al abrirla. */}
        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-cyan-600 dark:text-cyan-300">
          Ver planes
          <span className="transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
    </Link>
  );
}
