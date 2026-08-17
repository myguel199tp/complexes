"use client";

import { Title, Text, Badge } from "complexes-next-components";
import React, { useMemo, useState } from "react";
import ModalPlanSummary from "./modal/modal";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";

type Category =
  | "seguridad"
  | "admin"
  | "comunicacion"
  | "comunidad"
  | "economia"
  | "ia";

type Status = "ready" | "dev";

/** Disponibilidad de un módulo en un plan. */
type Access = "yes" | "lim" | "no";

interface ModuleMeta {
  /** Índice dentro de `serviciosBeneficio` en los archivos de idioma. */
  i: number;
  icon: string;
  category: Category;
  status: Status;
  /**
   * Acceso en [Básico, Oro, Platino].
   *
   * `key` indica de qué entrada de `plans_features` (locales) sale el dato.
   * Cuando es `null`, el módulo no está en esa tabla y la disponibilidad es un
   * supuesto comercial que hay que confirmar antes de publicar.
   */
  plans: [Access, Access, Access];
  key: string | null;
}

/**
 * Catálogo de módulos. El título y la descripción viven en los locales
 * (`serviciosBeneficio`) para que sigan traducidos; aquí solo va la metadata
 * de presentación. El campo `i` es explícito a propósito: si alguien agrega
 * una entrada en medio del arreglo de idiomas, se rompe de forma visible y no
 * en silencio.
 */
/** Posición dentro de `plans`: 0 Básico, 1 Oro, 2 Platino. */
type PlanIndex = 0 | 1 | 2;

const Y: Access = "yes";
const L: Access = "lim";
const N: Access = "no";

const CATALOG: ModuleMeta[] = [
  // ── Con dato en `plans_features` ───────────────────────────────────────
  {
    i: 4,
    icon: "💰",
    category: "economia",
    status: "ready",
    plans: [L, L, Y],
    key: "inmuebles",
  },
  {
    i: 5,
    icon: "📞",
    category: "seguridad",
    status: "ready",
    plans: [Y, Y, Y],
    key: "citofonia",
  },
  {
    i: 6,
    icon: "👥",
    category: "admin",
    status: "ready",
    plans: [N, Y, Y],
    key: "familiares",
  },
  {
    i: 7,
    icon: "📢",
    category: "comunicacion",
    status: "ready",
    plans: [L, L, Y],
    key: "comunciaciones",
  },
  {
    i: 10,
    icon: "📝",
    category: "admin",
    status: "ready",
    plans: [Y, Y, Y],
    key: "registroInterno",
  },
  {
    i: 11,
    icon: "📰",
    category: "comunicacion",
    status: "ready",
    plans: [L, L, Y],
    key: "cartelera",
  },
  {
    i: 12,
    icon: "🛒",
    category: "economia",
    status: "ready",
    plans: [N, N, Y],
    key: "productos",
  },
  {
    i: 13,
    icon: "📊",
    category: "admin",
    status: "ready",
    plans: [L, Y, Y],
    key: "balance",
  },
  {
    i: 14,
    icon: "🗣️",
    category: "comunidad",
    status: "ready",
    plans: [L, L, Y],
    key: "foro",
  },
  {
    i: 15,
    icon: "📂",
    category: "admin",
    status: "ready",
    plans: [L, L, Y],
    key: "documentos",
  },
  {
    i: 16,
    icon: "🛠️",
    category: "admin",
    status: "ready",
    plans: [N, Y, Y],
    key: "mantenimientos",
  },
  {
    i: 17,
    icon: "🗳️",
    category: "admin",
    status: "ready",
    plans: [N, Y, Y],
    key: "asambleas",
  },
  {
    i: 18,
    icon: "🏨",
    category: "economia",
    status: "ready",
    plans: [N, Y, Y],
    key: "registroExtermo",
  },
  {
    i: 19,
    icon: "🤖",
    category: "ia",
    status: "ready",
    plans: [L, L, Y],
    key: "agente",
  },
  {
    i: 20,
    icon: "🏪",
    category: "economia",
    status: "ready",
    plans: [N, N, Y],
    key: "productos",
  },
  {
    i: 21,
    icon: "🤝",
    category: "economia",
    status: "ready",
    plans: [N, N, Y],
    key: "alianzas",
  },
  {
    i: 25,
    icon: "🏊",
    category: "comunidad",
    status: "ready",
    plans: [Y, Y, Y],
    key: "social",
  },
  {
    i: 26,
    icon: "🧾",
    category: "admin",
    status: "ready",
    plans: [Y, Y, Y],
    key: "pazsalvos",
  },
  {
    i: 27,
    icon: "📮",
    category: "comunicacion",
    status: "ready",
    plans: [Y, Y, Y],
    key: "pqr",
  },
  {
    i: 32,
    icon: "💵",
    category: "admin",
    status: "ready",
    plans: [L, Y, Y],
    key: "gastos",
  },
  {
    i: 33,
    icon: "💳",
    category: "admin",
    status: "ready",
    plans: [Y, Y, Y],
    key: "pagos",
  },
  {
    i: 34,
    icon: "🏬",
    category: "economia",
    status: "ready",
    plans: [N, N, N],
    key: "locales",
  },
  {
    i: 35,
    icon: "🔑",
    category: "economia",
    status: "ready",
    plans: [N, N, N],
    key: "locales",
  },
  {
    i: 38,
    icon: "🧑‍🔧",
    category: "admin",
    status: "ready",
    plans: [Y, Y, Y],
    key: "colaboradores",
  },
  {
    i: 39,
    icon: "🎫",
    category: "economia",
    status: "ready",
    plans: [N, N, Y],
    key: "alianzas",
  },

  // ── Sin dato en `plans_features`: supuesto pendiente de confirmar ──────
  {
    i: 0,
    icon: "🔒",
    category: "seguridad",
    status: "ready",
    plans: [Y, Y, Y],
    key: null,
  },
  {
    i: 1,
    icon: "💬",
    category: "comunicacion",
    status: "ready",
    plans: [Y, Y, Y],
    key: null,
  },
  {
    i: 2,
    icon: "🏘️",
    category: "comunidad",
    status: "ready",
    plans: [Y, Y, Y],
    key: null,
  },
  {
    i: 3,
    icon: "🏖️",
    category: "economia",
    status: "ready",
    plans: [Y, Y, Y],
    key: null,
  },
  {
    i: 8,
    icon: "📅",
    category: "comunidad",
    status: "ready",
    plans: [Y, Y, Y],
    key: null,
  },
  {
    i: 9,
    icon: "🚪",
    category: "seguridad",
    status: "ready",
    plans: [Y, Y, Y],
    key: null,
  },
  {
    i: 22,
    icon: "🛵",
    category: "seguridad",
    status: "ready",
    plans: [N, N, Y],
    key: null,
  },
  {
    i: 23,
    icon: "🎟️",
    category: "seguridad",
    status: "ready",
    plans: [N, Y, Y],
    key: null,
  },
  {
    i: 29,
    icon: "🏛️",
    category: "admin",
    status: "ready",
    plans: [N, Y, Y],
    key: null,
  },
  {
    i: 30,
    icon: "🚨",
    category: "seguridad",
    status: "ready",
    plans: [Y, Y, Y],
    key: null,
  },
  {
    i: 31,
    icon: "📄",
    category: "admin",
    status: "ready",
    plans: [Y, Y, Y],
    key: null,
  },
  {
    i: 36,
    icon: "🎁",
    category: "economia",
    status: "ready",
    plans: [Y, Y, Y],
    key: null,
  },
  // La administración crea la multa desde la gestión de residentes y el
  // residente la consulta y paga desde su zona VIP (`/api/resident-fines`).
  {
    i: 41,
    icon: "⚖️",
    category: "admin",
    status: "ready",
    plans: [Y, Y, Y],
    key: null,
  },

  // ── En desarrollo: sin plan asignado todavía ──────────────────────────
  {
    i: 24,
    icon: "📹",
    category: "seguridad",
    status: "dev",
    plans: [N, N, N],
    key: null,
  },
  {
    i: 28,
    icon: "✍️",
    category: "admin",
    status: "dev",
    plans: [N, N, N],
    key: null,
  },
  {
    i: 37,
    icon: "🔄",
    category: "comunidad",
    status: "dev",
    plans: [N, N, N],
    key: null,
  },
  // El módulo `parking` del backend es solo el catálogo de cupos que se elige
  // al publicar un inmueble; la gestión de celdas del conjunto no existe.
  {
    i: 40,
    icon: "🅿️",
    category: "seguridad",
    status: "dev",
    plans: [N, N, N],
    key: null,
  },
];

const MODULES = [...CATALOG].sort((a, b) => a.i - b.i);

const PLANS: { index: PlanIndex; tKey: string; short: string }[] = [
  { index: 0, tKey: "basico", short: "B" },
  { index: 1, tKey: "oro", short: "O" },
  // "plation" es la clave existente en los locales para Platino.
  { index: 2, tKey: "plation", short: "P" },
];

const ACCESS_LABEL: Record<Access, string> = {
  yes: "modulosIncluido",
  lim: "modulosLimitado",
  no: "modulosNoIncluido",
};

const ACCESS_STYLE: Record<Access, string> = {
  yes: "bg-cyan-700 text-white border-cyan-700",
  lim: "bg-amber-50 text-amber-700 border-amber-400",
  no: "bg-gray-100 text-gray-400 border-gray-200 line-through",
};

const CATEGORY_KEYS: { value: Category; tKey: string }[] = [
  { value: "seguridad", tKey: "modulosSeguridad" },
  { value: "admin", tKey: "modulosAdmin" },
  { value: "comunicacion", tKey: "modulosComunicacion" },
  { value: "comunidad", tKey: "modulosComunidad" },
  { value: "economia", tKey: "modulosEconomia" },
  { value: "ia", tKey: "modulosIa" },
];

export default function Aboutus() {
  const [selected, setSelected] = useState<{
    title: string;
    text: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<Category | "all">("all");
  const [plan, setPlan] = useState<PlanIndex | "all">("all");
  const { t } = useTranslation();
  const { language } = useLanguage();

  const items = useMemo(
    () =>
      MODULES.map((m) => ({
        ...m,
        title: t(`serviciosBeneficio.${m.i}.title`),
        text: t(`serviciosBeneficio.${m.i}.text`),
      })),
    [t],
  );

  const porCategoria =
    filter === "all" ? items : items.filter((m) => m.category === filter);

  // Al filtrar por plan se ocultan los módulos que ese plan no incluye; los que
  // tienen tope mensual siguen visibles porque sí se pueden usar.
  const visibles =
    plan === "all"
      ? porCategoria
      : porCategoria.filter((m) => m.plans[plan] !== "no");

  const enDesarrollo = items.filter((m) => m.status === "dev").length;

  const handleItemClick = (item: { title: string; text: string }) => {
    setSelected(item);
    setIsModalOpen(true);
  };

  return (
    <section key={language} className="space-y-10">
      <header className="rounded-2xl bg-gradient-to-br from-cyan-800 to-cyan-600 p-8 text-white shadow-xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl space-y-3">
            <Badge className="w-fit bg-white/20 text-white">
              Ecosistema modular
            </Badge>

            <Title size="md" font="bold">
              Módulos de la plataforma
            </Title>

            <Text className="text-cyan-100">
              Herramientas integradas para la gestión moderna de conjuntos,
              comunicación institucional y control preventivo. Cada conjunto
              activa lo que necesita.
            </Text>
          </div>

          <div className="flex gap-4">
            <Stat value={items.length - enDesarrollo} label="disponibles" />
            <Stat value={enDesarrollo} label="en desarrollo" />
          </div>
        </div>
      </header>

      {/* FILTROS POR CATEGORÍA */}
      <div className="flex flex-wrap gap-2">
        <FilterChip
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label={`${t("modulosTodos")} (${items.length})`}
        />

        {CATEGORY_KEYS.map((c) => {
          const total = items.filter((m) => m.category === c.value).length;
          if (total === 0) return null;

          return (
            <FilterChip
              key={c.value}
              active={filter === c.value}
              onClick={() => setFilter(c.value)}
              label={`${t(c.tKey)} (${total})`}
            />
          );
        })}
      </div>

      {/* FILTRO POR PLAN + LEYENDA */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Text size="sm" font="bold" className="mr-1">
              {t("modulosPlanTitulo")}:
            </Text>

            <FilterChip
              active={plan === "all"}
              onClick={() => setPlan("all")}
              label={t("modulosPlanTodos")}
            />

            {PLANS.map((p) => {
              const total = items.filter(
                (m) => m.plans[p.index] !== "no",
              ).length;

              return (
                <FilterChip
                  key={p.index}
                  active={plan === p.index}
                  onClick={() => setPlan(p.index)}
                  label={`${t(p.tKey)} (${total})`}
                />
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Legend tone="yes" label={t("modulosIncluido")} />
            <Legend tone="lim" label={t("modulosLimitado")} />
            <Legend tone="no" label={t("modulosNoIncluido")} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {visibles.map((b) => (
          <div
            key={b.i}
            onClick={() => handleItemClick({ title: b.title, text: b.text })}
            className={`group cursor-pointer rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
              b.status === "dev" ? "border-dashed border-amber-300" : ""
            }`}
          >
            <div className="mb-4 flex items-start justify-between">
              <div
                className={`text-3xl ${b.status === "dev" ? "opacity-60" : ""}`}
              >
                {b.icon}
              </div>

              {b.status === "dev" ? (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                  {t("modulosDesarrollo")}
                </span>
              ) : (
                <span className="text-xs text-cyan-700 opacity-0 transition group-hover:opacity-100">
                  Ver más
                </span>
              )}
            </div>

            <Title as="h3" size="sm" font="semi">
              {b.title}
            </Title>

            <Text size="xs" className="mt-2 line-clamp-3 text-gray-600">
              {b.text}
            </Text>

            {b.status === "ready" ? (
              <div className="mt-4 flex gap-1.5 border-t pt-3">
                {PLANS.map((p) => (
                  <PlanBadge
                    key={p.index}
                    short={p.short}
                    name={t(p.tKey)}
                    access={b.plans[p.index]}
                    accessLabel={t(ACCESS_LABEL[b.plans[p.index]])}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      {/* NOTA SOBRE LO QUE AÚN NO ESTÁ */}
      <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/50 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-2xl">🚧</span>
          <Title size="xs" font="bold">
            Módulos en desarrollo
          </Title>
        </div>

        <Text size="sm" className="mt-2 max-w-3xl text-gray-600">
          Los módulos marcados con borde punteado están en construcción y se
          habilitan por etapas. Los publicamos aquí desde ya para que sepas
          hacia dónde va la plataforma, no para venderte algo que todavía no
          puedes usar.
        </Text>
      </div>

      {selected && (
        <ModalPlanSummary
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selected.title}
          text={selected.text}
        />
      )}
    </section>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl bg-white/15 px-5 py-3 text-center backdrop-blur-sm">
      <span className="block text-3xl font-bold">{value}</span>
      <span className="text-xs text-cyan-50">{label}</span>
    </div>
  );
}

function PlanBadge({
  short,
  name,
  access,
  accessLabel,
}: {
  short: string;
  name: string;
  access: Access;
  accessLabel: string;
}) {
  return (
    <span
      title={`${name}: ${accessLabel}`}
      className={`flex h-6 w-6 items-center justify-center rounded-md border text-[11px] font-bold ${ACCESS_STYLE[access]}`}
    >
      {short}
      <span className="sr-only">{`${name}: ${accessLabel}`}</span>
    </span>
  );
}

function Legend({ tone, label }: { tone: Access; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span
        className={`h-4 w-4 rounded border ${ACCESS_STYLE[tone]}`}
        aria-hidden="true"
      />
      <span className="text-xs text-gray-600">{label}</span>
    </span>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
        active
          ? "border-cyan-700 bg-cyan-700 text-white"
          : "border-gray-300 bg-white text-gray-600 hover:border-cyan-600 hover:text-cyan-800"
      }`}
    >
      {label}
    </button>
  );
}
