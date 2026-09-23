"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  InputField,
  Modal,
  SelectField,
  Table,
  Text,
  Title,
} from "complexes-next-components";
import Link from "next/link";

import { useComercioGuard } from "../_lib/comercio-auth";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import DateField from "@/app/components/ui/date-field/DateField";
import { getBranches } from "../branches/services/comercioBranchService";
import {
  AdAudience,
  AdCampaign,
  AdFormat,
  AdStatus,
  createAd,
  deleteAd,
  getAdPricing,
  getAdReach,
  getAds,
  pauseAd,
  payAd,
  quoteAd,
  resumeAd,
} from "./services/comercioAdsService";

/**
 * De menos a más invasivo. El orden importa: es el que ve el comercio al
 * elegir, y el que explica por qué el de abajo cuesta más y llega a menos.
 */
const formatOptions: { label: string; value: AdFormat; hint: string }[] = [
  {
    label: "Tarjeta en el feed",
    value: "FEED_CARD",
    hint: "Se desplaza con el contenido. Llega a todos los conjuntos, incluidos los platino.",
  },
  {
    label: "Banner",
    value: "BANNER",
    hint: "Franja fija. No llega a los conjuntos platino.",
  },
  {
    label: "Pantalla completa",
    value: "INTERSTITIAL",
    hint: "Interrumpe y hay que cerrarlo. Sólo lo reciben los conjuntos del plan básico.",
  },
];

const audienceOptions: { label: string; value: AdAudience }[] = [
  { label: "Todos los residentes", value: "ALL" },
  { label: "Los que ya me compraron", value: "BUYERS" },
  { label: "Los que nunca me han comprado", value: "NON_BUYERS" },
  { label: "Los que dejaron de comprarme", value: "LAPSED" },
];

const statusLabel: Record<AdStatus, { text: string; variant: string }> = {
  DRAFT: { text: "Borrador", variant: "default" },
  SCHEDULED: { text: "Programado", variant: "warning" },
  RUNNING: { text: "Al aire", variant: "success" },
  PAUSED: { text: "Pausado", variant: "warning" },
  EXHAUSTED: { text: "Agotado", variant: "default" },
  ENDED: { text: "Terminado", variant: "default" },
  SUSPENDED: { text: "Suspendido", variant: "danger" },
};

const formatLabel: Record<AdFormat, string> = {
  FEED_CARD: "Tarjeta",
  BANNER: "Banner",
  INTERSTITIAL: "Pantalla completa",
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

const emptyForm = {
  title: "",
  body: "",
  imageFilename: "",
  ctaLabel: "",
  branchId: "",
  format: "FEED_CARD" as AdFormat,
  startsAt: today(),
  durationDays: "30",
  impressions: "10000",
  dailyImpressionCap: "",
  conjuntoIds: [] as string[],
  audience: "ALL" as AdAudience,
  minOrders: "1",
  lapsedDays: "60",
};

/**
 * Publicidad del comercio dentro de la app del residente.
 *
 * La pantalla gira alrededor del cotizador, no del formulario: lo que el
 * comercio necesita decidir no es "qué escribo" sino "a cuánta gente llego y
 * cuánto me cuesta". Por eso la cotización se recalcula sola mientras arma la
 * campaña y muestra, con nombre, los conjuntos que **no** van a recibirla
 * porque su plan no admite ese formato. Enterarse de eso después de pagar es
 * lo que convierte un producto en un reclamo.
 */
export default function ComercioAdsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  useComercioGuard(() => router.push("/comercio/login"));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const adsQuery = useQuery({ queryKey: ["comercio-ads"], queryFn: getAds });
  const pricingQuery = useQuery({
    queryKey: ["comercio-ads-pricing"],
    queryFn: getAdPricing,
  });
  const branchesQuery = useQuery({
    queryKey: ["comercio-branches"],
    queryFn: getBranches,
  });
  const reachQuery = useQuery({
    queryKey: ["comercio-ads-reach", form.format],
    queryFn: () => getAdReach(form.format),
    enabled: isModalOpen,
  });

  const quotePayload = useMemo(
    () => ({
      format: form.format,
      impressions: Number(form.impressions) || 0,
      durationDays: Number(form.durationDays) || 0,
      conjuntoIds: form.conjuntoIds.length ? form.conjuntoIds : undefined,
      audience: form.audience,
    }),
    [form.format, form.impressions, form.durationDays, form.conjuntoIds, form.audience],
  );

  const quoteMutation = useMutation({ mutationFn: quoteAd });
  const quote = quoteMutation.data;

  // Se recotiza con un respiro de por medio: el comercio teclea "10000" dígito
  // a dígito y sin esto serían cinco cotizaciones, cuatro de ellas de precios
  // que nunca quiso.
  useEffect(() => {
    if (!isModalOpen) return;
    if (!quotePayload.impressions || !quotePayload.durationDays) return;

    const timer = setTimeout(() => quoteMutation.mutate(quotePayload), 450);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen, quotePayload]);

  const createMutation = useMutation({
    mutationFn: () =>
      createAd({
        title: form.title,
        body: form.body || undefined,
        imageFilename: form.imageFilename || undefined,
        ctaLabel: form.ctaLabel || undefined,
        branchId: form.branchId || undefined,
        format: form.format,
        startsAt: new Date(form.startsAt).toISOString(),
        durationDays: Number(form.durationDays),
        impressions: Number(form.impressions),
        dailyImpressionCap: form.dailyImpressionCap
          ? Number(form.dailyImpressionCap)
          : undefined,
        conjuntoIds: form.conjuntoIds.length ? form.conjuntoIds : undefined,
        audience: form.audience,
        minOrders: Number(form.minOrders) || undefined,
        lapsedDays: Number(form.lapsedDays) || undefined,
      }),
    onSuccess: () => {
      showAlert("Anuncio creado como borrador. Págalo para ponerlo al aire.", "success");
      queryClient.invalidateQueries({ queryKey: ["comercio-ads"] });
      closeModal();
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const payMutation = useMutation({
    mutationFn: payAd,
    onSuccess: () => {
      showAlert("Pagado. El anuncio ya está programado.", "success");
      queryClient.invalidateQueries({ queryKey: ["comercio-ads"] });
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, paused }: { id: string; paused: boolean }) =>
      paused ? resumeAd(id) : pauseAd(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["comercio-ads"] }),
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAd,
    onSuccess: () => {
      showAlert("Borrador eliminado", "success");
      queryClient.invalidateQueries({ queryKey: ["comercio-ads"] });
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  function closeModal() {
    setIsModalOpen(false);
    setForm(emptyForm);
    quoteMutation.reset();
  }

  function toggleConjunto(id: string) {
    setForm((prev) => ({
      ...prev,
      conjuntoIds: prev.conjuntoIds.includes(id)
        ? prev.conjuntoIds.filter((c) => c !== id)
        : [...prev.conjuntoIds, id],
    }));
  }

  const ads = adsQuery.data ?? [];
  const pricing = pricingQuery.data;
  const reach = reachQuery.data ?? [];
  const branchOptions = (branchesQuery.data ?? []).map((branch) => ({
    label: `${branch.name} (${branch.city})`,
    value: branch.id,
  }));

  const headers = [
    "Anuncio",
    "Formato",
    "Vigencia",
    "Consumo",
    "Clics",
    "Total",
    "Estado",
    "",
  ];

  const rows = ads.map((ad) => [
    ad.title,
    formatLabel[ad.format],
    `${new Date(ad.startsAt).toLocaleDateString()} → ${new Date(ad.endsAt).toLocaleDateString()}`,
    `${ad.impressionsServed.toLocaleString()} / ${ad.impressionsPurchased.toLocaleString()}`,
    String(ad.clicks),
    `$${Number(ad.totalAmount).toLocaleString()}`,
    <Badge
      key={`status-${ad.id}`}
      colVariant={statusLabel[ad.status].variant as never}
      size="xs"
    >
      {statusLabel[ad.status].text}
    </Badge>,
    <AdActions
      key={`actions-${ad.id}`}
      ad={ad}
      onPay={() => payMutation.mutate(ad.id)}
      onToggle={() =>
        toggleMutation.mutate({ id: ad.id, paused: ad.status === "PAUSED" })
      }
      onDelete={() => deleteMutation.mutate(ad.id)}
    />,
  ]);

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/comercio/dashboard" className="text-cyan-400 text-sm">
              ← Volver al panel
            </Link>
            <Title as="h1" size="lg" colVariant="on" font="semi" className="mt-2">
              Publicidad en la app
            </Title>
          </div>
          <Button colVariant="success" rounded="md" onClick={() => setIsModalOpen(true)}>
            + Crear anuncio
          </Button>
        </div>

        {pricing && (
          <div className="mb-5 rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-2xl">
            <Text size="sm" className="text-slate-300">
              Se paga por adelantado y se consume por impresión mostrada: compras
              un número de impresiones con una vigencia, y se acaba con lo que
              ocurra primero. Desde{" "}
              <strong>${pricing.cpmFeedCard.toLocaleString()}</strong> por cada
              1.000 impresiones en tarjeta.
            </Text>
          </div>
        )}

        {/*
          La tabla de abajo cuenta impresiones, que es lo que se factura. A
          cuántas *personas* llegaste y en qué conjuntos compran después de ver
          el anuncio no cabe en una fila, y es justo lo que decide si vale la
          pena repetir: para eso está el asistente.
        */}
        {ads.length > 0 && (
          <Link
            href="/comercio/assistant"
            className="mb-5 flex items-center gap-3 rounded-2xl border border-cyan-500/30 bg-cyan-500/[0.07] p-4 transition hover:bg-cyan-500/[0.12]"
          >
            <span className="text-xl">📢</span>
            <span className="flex flex-col">
              <span className="text-sm font-semibold text-slate-100">
                ¿A cuántas personas llegaste de verdad?
              </span>
              <span className="text-xs text-slate-400">
                Pregúntale al asistente en qué conjunto te va mejor y si te va a
                alcanzar el paquete
              </span>
            </span>
          </Link>
        )}

        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-2xl overflow-x-auto">
          {adsQuery.isLoading ? (
            <Text size="sm" className="p-4 text-slate-400">
              Cargando anuncios...
            </Text>
          ) : ads.length === 0 ? (
            <Text size="sm" className="p-4 text-slate-400">
              Aún no tienes anuncios. Crea el primero y mira a cuánta gente llegas
              antes de pagar.
            </Text>
          ) : (
            <Table headers={headers} rows={rows} colVariant="default" />
          )}
        </div>

        {ads.some((ad) => ad.status === "SUSPENDED") && (
          <div className="mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
            {ads
              .filter((ad) => ad.status === "SUSPENDED")
              .map((ad) => (
                <Text key={ad.id} size="sm" className="text-red-200">
                  <strong>{ad.title}</strong> fue suspendido:{" "}
                  {ad.suspensionReason}
                  {ad.creditedImpressions > 0 && (
                    <>
                      {" "}Se te abonaron {ad.creditedImpressions.toLocaleString()}{" "}
                      impresiones (${Number(ad.creditedAmount).toLocaleString()}).
                    </>
                  )}
                </Text>
              ))}
          </div>
        )}
      </div>

      <Modal
        className="w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto"
        isOpen={isModalOpen}
        onClose={closeModal}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate();
          }}
          className="grid gap-4 p-4 md:grid-cols-2"
        >
          <div className="md:col-span-2">
            <Title as="h2" size="md" font="semi">
              Nuevo anuncio
            </Title>
          </div>

          {/* ── Creativo ───────────────────────────────────────────────── */}
          <div className="grid gap-3">
            <InputField
              placeholder="Título"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              helpText="Lo que se lee grande. Máximo 80 caracteres."
              sizeHelp="xs"
              inputSize="md"
              rounded="md"
              required
            />

            <InputField
              placeholder="Texto (opcional)"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              inputSize="md"
              rounded="md"
            />

            <InputField
              placeholder="Texto del botón (opcional)"
              value={form.ctaLabel}
              onChange={(e) => setForm({ ...form, ctaLabel: e.target.value })}
              inputSize="md"
              rounded="md"
            />

            <SelectField
              options={branchOptions}
              defaultOption="Todo el comercio"
              value={form.branchId}
              onChange={(e) => setForm({ ...form, branchId: e.target.value })}
              helpText="Sucursal que anuncia"
              sizeHelp="xs"
              inputSize="md"
              rounded="md"
            />

            <SelectField
              options={formatOptions.map((o) => ({
                label: o.label,
                value: o.value,
              }))}
              value={form.format}
              onChange={(e) =>
                setForm({ ...form, format: e.target.value as AdFormat })
              }
              helpText={
                formatOptions.find((o) => o.value === form.format)?.hint ?? ""
              }
              sizeHelp="xs"
              inputSize="md"
              rounded="md"
            />
          </div>

          {/* ── Paquete y segmentación ─────────────────────────────────── */}
          <div className="grid gap-3">
            <DateField
              value={form.startsAt}
              onChange={(value: string) => setForm({ ...form, startsAt: value })}
              label="Empieza el"
            />

            <div className="grid grid-cols-2 gap-3">
              <InputField
                type="number"
                placeholder="Días"
                value={form.durationDays}
                onChange={(e) =>
                  setForm({ ...form, durationDays: e.target.value })
                }
                helpText="Duración"
                sizeHelp="xs"
                inputSize="md"
                rounded="md"
              />
              <InputField
                type="number"
                placeholder="Impresiones"
                value={form.impressions}
                onChange={(e) =>
                  setForm({ ...form, impressions: e.target.value })
                }
                helpText="Veces que se muestra"
                sizeHelp="xs"
                inputSize="md"
                rounded="md"
              />
            </div>

            <InputField
              type="number"
              placeholder={
                quote ? String(quote.suggestedDailyCap) : "Tope por día"
              }
              value={form.dailyImpressionCap}
              onChange={(e) =>
                setForm({ ...form, dailyImpressionCap: e.target.value })
              }
              helpText="Tope diario, para que el paquete dure lo previsto. Vacío = el sugerido."
              sizeHelp="xs"
              inputSize="md"
              rounded="md"
            />

            <SelectField
              options={audienceOptions}
              value={form.audience}
              onChange={(e) =>
                setForm({ ...form, audience: e.target.value as AdAudience })
              }
              helpText="A quién le llega"
              sizeHelp="xs"
              inputSize="md"
              rounded="md"
            />

            {form.audience === "LAPSED" && (
              <InputField
                type="number"
                placeholder="60"
                value={form.lapsedDays}
                onChange={(e) =>
                  setForm({ ...form, lapsedDays: e.target.value })
                }
                helpText="Días sin comprarte"
                sizeHelp="xs"
                inputSize="md"
                rounded="md"
              />
            )}

            {form.audience === "BUYERS" && (
              <InputField
                type="number"
                placeholder="1"
                value={form.minOrders}
                onChange={(e) => setForm({ ...form, minOrders: e.target.value })}
                helpText="Compras mínimas"
                sizeHelp="xs"
                inputSize="md"
                rounded="md"
              />
            )}
          </div>

          {/* ── Conjuntos ──────────────────────────────────────────────── */}
          <div className="md:col-span-2">
            <Text size="sm" className="mb-2 text-slate-300">
              Conjuntos. Sin marcar ninguno, llega a todos donde tienes
              suscripción activa.
            </Text>

            <div className="flex flex-wrap gap-2">
              {reach.map((conjunto) => {
                const selected = form.conjuntoIds.includes(conjunto.id);

                return (
                  <button
                    key={conjunto.id}
                    type="button"
                    disabled={!conjunto.eligible}
                    onClick={() => toggleConjunto(conjunto.id)}
                    title={
                      conjunto.eligible
                        ? `${conjunto.apartments} apartamentos`
                        : `El plan ${conjunto.plan} no recibe este formato`
                    }
                    className={[
                      "rounded-full border px-3 py-1 text-xs transition",
                      !conjunto.eligible
                        ? "cursor-not-allowed border-white/10 text-slate-600 line-through"
                        : selected
                          ? "border-cyan-400 bg-cyan-400/20 text-cyan-200"
                          : "border-white/20 text-slate-300 hover:border-cyan-400/50",
                    ].join(" ")}
                  >
                    {conjunto.name}{" "}
                    <span className="opacity-60">({conjunto.plan})</span>
                  </button>
                );
              })}

              {reach.length === 0 && !reachQuery.isLoading && (
                <div className="flex flex-col gap-3 rounded-xl border border-amber-300/30 bg-amber-300/10 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <Text size="sm" className="text-amber-300">
                    No tienes suscripción activa a ningún conjunto, así que
                    todavía no puedes anunciarte. La suscripción se hace por
                    sucursal, desde la lista de conjuntos cercanos.
                  </Text>
                  {/* Con una sola sucursal se va directo a sus conjuntos; con
                      varias (o ninguna) hay que elegir o crear la sucursal. */}
                  <Link
                    href={
                      branchesQuery.data?.length === 1
                        ? `/comercio/branches/${branchesQuery.data[0].id}/conjuntos`
                        : "/comercio/branches"
                    }
                    className="shrink-0 rounded-lg bg-amber-400 px-4 py-2 text-center text-sm font-semibold text-slate-950 transition-colors hover:bg-amber-300"
                  >
                    Suscribirme a un conjunto →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* ── Cotización ─────────────────────────────────────────────── */}
          <div className="md:col-span-2 rounded-2xl border border-cyan-400/25 bg-cyan-400/5 p-4">
            {quoteMutation.isPending && !quote ? (
              <Text size="sm" className="text-slate-400">
                Calculando...
              </Text>
            ) : quoteMutation.isError ? (
              <Text size="sm" colVariant="danger">
                {(quoteMutation.error as Error).message}
              </Text>
            ) : quote ? (
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <Text size="xs" className="text-slate-400">
                    Total a pagar
                  </Text>
                  <Title as="h3" size="md" font="semi" colVariant="on">
                    ${quote.totalAmount.toLocaleString()} {quote.currency}
                  </Title>
                  <Text size="xs" className="text-slate-400">
                    ${quote.cpm.toLocaleString()} por mil
                    {quote.targetingSurcharge > 0 &&
                      ` · +${Math.round(quote.targetingSurcharge * 100)}% por segmentar`}
                  </Text>
                </div>

                <div>
                  <Text size="xs" className="text-slate-400">
                    Le llega a
                  </Text>
                  <Title as="h3" size="md" font="semi" colVariant="on">
                    {quote.reach.apartments.toLocaleString()} apartamentos
                  </Title>
                  <Text size="xs" className="text-slate-400">
                    en {quote.reach.eligibleConjuntos} conjunto(s)
                  </Text>
                </div>

                <div>
                  <Text size="xs" className="text-slate-400">
                    Ritmo sugerido
                  </Text>
                  <Title as="h3" size="md" font="semi" colVariant="on">
                    {quote.suggestedDailyCap.toLocaleString()} / día
                  </Title>
                </div>

                {quote.notes.length > 0 && (
                  <div className="md:col-span-3 grid gap-1">
                    {quote.notes.map((note) => (
                      <Text key={note} size="xs" className="text-amber-300">
                        {note}
                      </Text>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Text size="sm" className="text-slate-400">
                Completa duración e impresiones para ver el precio y el alcance.
              </Text>
            )}
          </div>

          <div className="md:col-span-2 flex justify-end gap-2">
            <Button type="button" rounded="md" onClick={closeModal}>
              Cancelar
            </Button>
            <Button
              type="submit"
              colVariant="success"
              rounded="md"
              disabled={createMutation.isPending || !quote}
            >
              {createMutation.isPending ? "Guardando..." : "Guardar borrador"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/**
 * Los botones dependen del estado, y el estado dice qué es legítimo hacer: un
 * borrador se paga o se borra, uno al aire se pausa, y uno que suspendimos
 * nosotros no se toca desde aquí.
 */
function AdActions({
  ad,
  onPay,
  onToggle,
  onDelete,
}: {
  ad: AdCampaign;
  onPay: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  if (ad.status === "DRAFT") {
    return (
      <div className="flex gap-2">
        <Button size="xs" rounded="md" colVariant="success" onClick={onPay}>
          Pagar ${Number(ad.totalAmount).toLocaleString()}
        </Button>
        <Button size="xs" rounded="md" colVariant="danger" onClick={onDelete}>
          Borrar
        </Button>
      </div>
    );
  }

  if (ad.status === "RUNNING" || ad.status === "SCHEDULED") {
    return (
      <Button size="xs" rounded="md" colVariant="warning" onClick={onToggle}>
        Pausar
      </Button>
    );
  }

  if (ad.status === "PAUSED") {
    return (
      <Button size="xs" rounded="md" colVariant="success" onClick={onToggle}>
        Reanudar
      </Button>
    );
  }

  return null;
}
