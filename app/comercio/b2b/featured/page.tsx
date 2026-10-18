"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Text, Title } from "complexes-next-components";

import { useComercioGuard } from "../../_lib/comercio-auth";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { InputField, SelectField } from "@/app/components/ui/form";
import { B2B_SERVICE_CATEGORY_LABELS } from "@/app/helpers/b2bServiceCategories";
import type { B2bServiceCategory } from "@/app/helpers/b2bServiceCategories";
import {
  B2bAdScope,
  B2bAdSignal,
  B2bAdStats,
  B2bAdStatus,
  B2bPlacement,
  createB2bPlacement,
  deleteB2bPlacement,
  getB2bAdPricing,
  getB2bAdProfile,
  getB2bPlacementStats,
  getB2bPlacements,
  pauseB2bPlacement,
  payB2bPlacement,
  quoteB2bAd,
  resumeB2bPlacement,
} from "../services/b2bFeaturedService";

const SIGNALS: { value: B2bAdSignal; label: string; hint: string }[] = [
  {
    value: "open_demand",
    label: "Con compra en grupo abierta",
    hint: "Conjuntos que publicaron o se sumaron a una convocatoria de tu categoría.",
  },
  {
    value: "no_provider",
    label: "Sin proveedor de tu categoría",
    hint: "No tienen registrado quién les presta ese servicio.",
  },
  {
    value: "contract_ending",
    label: "Con contrato por vencer",
    hint: "Su contrato de esa categoría con otro proveedor vence en 90 días.",
  },
];

const STATUS: Record<B2bAdStatus, { text: string; tone: string }> = {
  draft: { text: "Borrador", tone: "text-slate-300" },
  scheduled: { text: "Programado", tone: "text-sky-300" },
  running: { text: "Al aire", tone: "text-emerald-300" },
  paused: { text: "Pausado", tone: "text-amber-300" },
  ended: { text: "Terminado", tone: "text-slate-400" },
  suspended: { text: "Suspendido", tone: "text-red-300" },
};

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  category: "" as B2bServiceCategory | "",
  scope: "coverage" as B2bAdScope,
  city: "",
  months: "3",
  startsAt: today(),
  title: "",
  body: "",
  minApartments: "",
  maxApartments: "",
  signals: [] as B2bAdSignal[],
};

const money = (value: number, currency: string) =>
  `$${Math.round(value).toLocaleString("es-CO")} ${currency}`;

/**
 * Destacados B2B: el proveedor aparece primero ante las administraciones que
 * buscan su categoría, en el catálogo de aliados y, en los planes básico y
 * oro, en mantenimientos y gastos.
 *
 * Es otra cosa que la publicidad B2C: le habla a quien contrata para el
 * conjunto, no al residente que compra. Mes fijo por categoría y ciudad, con
 * cupo limitado —si cualquiera pudiera comprarlo, el catálogo volvería a ser
 * una lista sin primero—.
 */
export default function ComercioB2bFeaturedPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);
  useComercioGuard(() => router.push("/comercio/login"));

  const [form, setForm] = useState(emptyForm);
  const [statsOf, setStatsOf] = useState<string | null>(null);

  const profileQuery = useQuery({ queryKey: ["comercio_profile_b2b_ads"], queryFn: getB2bAdProfile });
  const pricingQuery = useQuery({ queryKey: ["comercio_b2b_ads_pricing"], queryFn: getB2bAdPricing });
  const listQuery = useQuery({ queryKey: ["comercio_b2b_ads"], queryFn: getB2bPlacements });
  const statsQuery = useQuery({
    queryKey: ["comercio_b2b_ads_stats", statsOf],
    queryFn: () => getB2bPlacementStats(String(statsOf)),
    enabled: !!statsOf,
  });

  const categories = profileQuery.data?.serviceCategories ?? [];
  const coverage = (profileQuery.data?.coverageCities ?? []).filter(Boolean);
  const national = coverage.length === 0;

  // El alcance por defecto depende de la cobertura: con cobertura nacional no
  // existe "mis ciudades", y con cobertura local no se puede todo el país.
  useEffect(() => {
    if (!profileQuery.data) return;
    setForm((prev) => ({
      ...prev,
      scope: national ? "national" : "coverage",
      category: prev.category || categories[0] || "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileQuery.data]);

  const quotePayload = useMemo(
    () =>
      form.category
        ? {
            category: form.category,
            scope: form.scope,
            city: form.scope === "city" ? form.city || undefined : undefined,
            months: Number(form.months) || 0,
            startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
          }
        : null,
    [form.category, form.scope, form.city, form.months, form.startsAt],
  );

  const quoteMutation = useMutation({ mutationFn: quoteB2bAd });
  const quote = quoteMutation.data;

  useEffect(() => {
    if (!quotePayload || !quotePayload.months) return;
    if (quotePayload.scope === "city" && !quotePayload.city) return;
    const timer = setTimeout(() => quoteMutation.mutate(quotePayload), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotePayload]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["comercio_b2b_ads"] });
  const onError = (e: Error) => showAlert(e.message, "error");

  const createMutation = useMutation({
    mutationFn: () =>
      createB2bPlacement({
        ...quotePayload!,
        title: form.title,
        body: form.body || undefined,
        minApartments: Number(form.minApartments) || undefined,
        maxApartments: Number(form.maxApartments) || undefined,
        signals: form.signals.length ? form.signals : undefined,
      }),
    onSuccess: () => {
      showAlert("Destacado creado como borrador. Págalo para ponerlo al aire.", "success");
      setForm({ ...emptyForm, scope: national ? "national" : "coverage", category: categories[0] ?? "" });
      quoteMutation.reset();
      invalidate();
    },
    onError,
  });

  const act = useMutation<
    unknown,
    Error,
    { id: string; verb: "pay" | "pause" | "resume" | "delete" }
  >({
    mutationFn: ({ id, verb }) =>
      verb === "pay"
        ? payB2bPlacement(id)
        : verb === "pause"
          ? pauseB2bPlacement(id)
          : verb === "resume"
            ? resumeB2bPlacement(id)
            : deleteB2bPlacement(id),
    onSuccess: invalidate,
    onError,
  });

  const toggleSignal = (signal: B2bAdSignal) =>
    setForm((prev) => ({
      ...prev,
      signals: prev.signals.includes(signal)
        ? prev.signals.filter((s) => s !== signal)
        : [...prev.signals, signal],
    }));

  const placements = listQuery.data ?? [];
  const pricing = pricingQuery.data;

  const scopeOptions = [
    { value: "city", label: "Una ciudad" },
    ...(national ? [] : [{ value: "coverage", label: `Mis ciudades (${coverage.length})` }]),
    ...(national ? [{ value: "national", label: "Todo el país" }] : []),
  ];

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <Title as="h1" size="lg" colVariant="on" font="semi">
            Destacados
          </Title>
          <Text size="sm" className="mt-1 text-slate-400">
            Aparece de primero ante las administraciones que buscan proveedores de
            tu categoría. Lo ve la administración del conjunto, no los residentes.
            {pricing &&
              ` ${money(pricing.monthlyPerCity, pricing.currency)} al mes por ciudad, hasta ${pricing.maxPerCategoryCity} destacados por categoría y ciudad.`}
          </Text>
        </div>

        {categories.length === 0 && !profileQuery.isLoading ? (
          <div className="rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4">
            <Text size="sm" className="text-amber-200">
              Para destacarte necesitas tener tus categorías de servicio en el
              perfil: solo puedes destacarte en lo que prestas.
            </Text>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createMutation.mutate();
            }}
            className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6 md:grid-cols-2"
          >
            <SelectField
              options={categories.map((c) => ({
                value: c,
                label: B2B_SERVICE_CATEGORY_LABELS[c] ?? c,
              }))}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as B2bServiceCategory })}
              helpText="Categoría que destacas"
              sizeHelp="xs"
              inputSize="md"
              rounded="md"
            />

            <SelectField
              options={scopeOptions}
              value={form.scope}
              onChange={(e) => setForm({ ...form, scope: e.target.value as B2bAdScope, city: "" })}
              helpText="Dónde"
              sizeHelp="xs"
              inputSize="md"
              rounded="md"
            />

            {form.scope === "city" &&
              (national ? (
                <InputField
                  placeholder="Ciudad"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  helpText="Ciudad"
                  sizeHelp="xs"
                  inputSize="md"
                  rounded="md"
                />
              ) : (
                <SelectField
                  options={coverage.map((c) => ({ value: c, label: c }))}
                  defaultOption="Elige la ciudad"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  helpText="Solo las de tu cobertura"
                  sizeHelp="xs"
                  inputSize="md"
                  rounded="md"
                />
              ))}

            <div className="grid grid-cols-2 gap-3">
              <InputField
                type="number"
                placeholder="Meses"
                value={form.months}
                onChange={(e) => setForm({ ...form, months: e.target.value })}
                helpText={pricing ? `Meses (máx. ${pricing.maxMonths})` : "Meses"}
                sizeHelp="xs"
                inputSize="md"
                rounded="md"
              />
              <InputField
                type="date"
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                helpText="Empieza"
                sizeHelp="xs"
                inputSize="md"
                rounded="md"
              />
            </div>

            <div className="md:col-span-2 grid gap-3 md:grid-cols-2">
              <InputField
                placeholder="Título (ej. Aseo con personal fijo y supervisión)"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                inputSize="md"
                rounded="md"
                required
              />
              <InputField
                placeholder="Texto corto (opcional)"
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                inputSize="md"
                rounded="md"
              />
            </div>

            <div className="md:col-span-2 rounded-2xl border border-white/10 p-4">
              <Text size="sm" font="semi" className="text-slate-200">
                A quién (opcional)
              </Text>
              <Text size="xs" className="mb-3 text-slate-400">
                No cambia el precio: solo decide a qué administraciones no se les
                muestra. Si marcas varias señales, basta con que se cumpla una.
              </Text>
              <div className="mb-3 grid grid-cols-2 gap-3 md:max-w-sm">
                <InputField
                  type="number"
                  placeholder="Mín. aptos"
                  value={form.minApartments}
                  onChange={(e) => setForm({ ...form, minApartments: e.target.value })}
                  inputSize="sm"
                  rounded="md"
                />
                <InputField
                  type="number"
                  placeholder="Máx. aptos"
                  value={form.maxApartments}
                  onChange={(e) => setForm({ ...form, maxApartments: e.target.value })}
                  inputSize="sm"
                  rounded="md"
                />
              </div>
              <div className="grid gap-2">
                {SIGNALS.map((signal) => (
                  <label key={signal.value} className="flex cursor-pointer items-start gap-2">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={form.signals.includes(signal.value)}
                      onChange={() => toggleSignal(signal.value)}
                    />
                    <span>
                      <span className="text-sm text-slate-200">{signal.label}</span>
                      <span className="block text-xs text-slate-400">{signal.hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 rounded-2xl border border-purple-400/25 bg-purple-400/5 p-4">
              {quoteMutation.isError ? (
                <Text size="sm" colVariant="danger">
                  {(quoteMutation.error as Error).message}
                </Text>
              ) : quote ? (
                <div className="grid gap-2">
                  <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
                    <Title as="h3" size="md" font="semi" colVariant="on">
                      {quote.available ? money(quote.totalAmount, quote.currency) : "Sin cupo"}
                    </Title>
                    {quote.available && (
                      <Text size="xs" className="text-slate-400">
                        {money(quote.monthlyPrice, quote.currency)} al mes × {quote.months}
                        {" · "}
                        {quote.cities.length ? quote.cities.join(", ") : "Todo el país"}
                      </Text>
                    )}
                  </div>
                  {quote.notes.map((note) => (
                    <Text key={note} size="xs" className="text-amber-300">
                      {note}
                    </Text>
                  ))}
                </div>
              ) : (
                <Text size="sm" className="text-slate-400">
                  Elige categoría, alcance y meses para ver el precio y el cupo.
                </Text>
              )}
            </div>

            <div className="md:col-span-2 flex justify-end">
              <Button
                type="submit"
                colVariant="success"
                rounded="md"
                disabled={!quote?.available || !form.title.trim() || createMutation.isPending}
              >
                {createMutation.isPending ? "Guardando..." : "Guardar borrador"}
              </Button>
            </div>
          </form>
        )}

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
          <Title as="h2" size="sm" colVariant="on" font="semi">
            Mis destacados
          </Title>

          {placements.length === 0 ? (
            <Text size="sm" className="mt-2 text-slate-400">
              Todavía no tienes destacados.
            </Text>
          ) : (
            <div className="mt-3 grid gap-3">
              {placements.map((p) => (
                <PlacementRow
                  key={p.id}
                  placement={p}
                  busy={act.isPending}
                  onAction={(verb) => act.mutate({ id: p.id, verb })}
                  showStats={statsOf === p.id}
                  onStats={() => setStatsOf(statsOf === p.id ? null : p.id)}
                  stats={statsOf === p.id ? statsQuery.data : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PlacementRow({
  placement: p,
  busy,
  onAction,
  showStats,
  onStats,
  stats,
}: {
  placement: B2bPlacement;
  busy: boolean;
  onAction: (verb: "pay" | "pause" | "resume" | "delete") => void;
  showStats: boolean;
  onStats: () => void;
  stats?: B2bAdStats;
}) {
  const status = STATUS[p.status];

  return (
    <div className="rounded-2xl border border-white/10 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Text size="sm" font="semi" className="text-slate-100">
            {p.title}
          </Text>
          <Text size="xs" className="text-slate-400">
            {B2B_SERVICE_CATEGORY_LABELS[p.category] ?? p.category} ·{" "}
            {p.cities.length ? p.cities.join(", ") : "Todo el país"} ·{" "}
            {new Date(p.startsAt).toLocaleDateString()} → {new Date(p.endsAt).toLocaleDateString()}
          </Text>
          <Text size="xs" className={status.tone}>
            {status.text}
            {p.status === "suspended" && p.suspensionReason ? ` — ${p.suspensionReason}` : ""}
            {p.paymentStatus === "paid" && ` · ${p.impressions} vistas · ${p.clicks} clics`}
          </Text>
        </div>

        <div className="flex flex-wrap gap-2">
          {p.status === "draft" && (
            <>
              <Button size="xs" rounded="md" colVariant="success" disabled={busy} onClick={() => onAction("pay")}>
                Pagar {money(p.totalAmount, p.currency)}
              </Button>
              <Button size="xs" rounded="md" colVariant="danger" disabled={busy} onClick={() => onAction("delete")}>
                Borrar
              </Button>
            </>
          )}
          {(p.status === "running" || p.status === "scheduled") && (
            <Button size="xs" rounded="md" colVariant="warning" disabled={busy} onClick={() => onAction("pause")}>
              Pausar
            </Button>
          )}
          {p.status === "paused" && (
            <Button size="xs" rounded="md" colVariant="success" disabled={busy} onClick={() => onAction("resume")}>
              Reanudar
            </Button>
          )}
          {p.paymentStatus === "paid" && (
            <Button size="xs" rounded="md" onClick={onStats}>
              {showStats ? "Ocultar resultados" : "Resultados"}
            </Button>
          )}
        </div>
      </div>

      {showStats && (
        <div className="mt-3 grid grid-cols-2 gap-3 border-t border-white/10 pt-3 sm:grid-cols-4">
          {stats ? (
            <>
              <Stat label="Administraciones que lo vieron" value={stats.conjuntosReached} />
              <Stat label="Clics" value={stats.clicks} />
              <Stat
                label={`Cotizaciones en ${stats.windows.quoteDays} días`}
                value={stats.quotesAfter}
              />
              <Stat
                label={`Contratos en ${stats.windows.contractDays} días`}
                value={stats.contractsAfter}
              />
            </>
          ) : (
            <Text size="xs" className="text-slate-400">
              Cargando...
            </Text>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <Text size="xs" className="text-slate-400">
        {label}
      </Text>
      <Text size="md" font="semi" className="text-slate-100">
        {value.toLocaleString("es-CO")}
      </Text>
    </div>
  );
}
