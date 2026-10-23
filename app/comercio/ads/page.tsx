"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, Modal, Text, Title } from "complexes-next-components";
import { Table } from "@/app/components/ui/table";
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
  getAdCredit,
  getAdPricing,
  getAdReach,
  getAds,
  pauseAd,
  payAd,
  quoteAd,
  resumeAd,
  uploadAdImage,
  type AdPricingConfig,
} from "./services/comercioAdsService";
import { InputField, SelectField } from "@/app/components/ui/form";

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
    hint: "Franja fija, con imagen. No llega a los conjuntos platino.",
  },
  {
    label: "Pantalla completa",
    value: "INTERSTITIAL",
    hint: "Interrumpe y hay que cerrarlo, con imagen. Sólo lo reciben los conjuntos del plan básico.",
  },
];

/**
 * La imagen es de los formatos que cuestan más por mil. El servidor rechaza
 * una tarjeta con imagen: sería el mismo anuncio con foto al precio más bajo.
 */
const FORMATS_WITH_IMAGE: AdFormat[] = ["BANNER", "INTERSTITIAL"];

const MAX_IMAGE_MB = 5;

function cpmFor(pricing: AdPricingConfig, format: AdFormat) {
  if (format === "BANNER") return pricing.cpmBanner;
  if (format === "INTERSTITIAL") return pricing.cpmInterstitial;
  return pricing.cpmFeedCard;
}

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

/** El total con IVA, con la misma regla de redondeo que el servidor. */
function withIva(base: number, rate: number) {
  return Math.ceil(Math.round(base * (1 + rate) * 100) / 100);
}

const emptyForm = {
  title: "",
  body: "",
  // Se sube al guardar, no al elegirla: si el comercio cancela, no queda un
  // archivo huérfano en el servidor.
  imageFile: null as File | null,
  ctaLabel: "",
  branchId: "",
  format: "FEED_CARD" as AdFormat,
  startsAt: today(),
  durationDays: "30",
  // 30 × 100 = 3.000, lo que dan unos tres conjuntos medianos en un mes: el
  // primer anuncio no debería dejar saldo sin gastar.
  dailyImpressions: "100",
  conjuntoIds: [] as string[],
  extendedReach: false,
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
  // Lo no servido de campañas suspendidas o vencidas. El servidor lo
  // descuenta solo al pagar; aquí se muestra para que el botón diga lo que
  // de verdad se va a cobrar.
  const creditQuery = useQuery({
    queryKey: ["comercio-ads-credit"],
    queryFn: getAdCredit,
  });
  const branchesQuery = useQuery({
    queryKey: ["comercio-branches"],
    queryFn: getBranches,
  });
  // Con sucursal, solo los conjuntos que suscribió esa sucursal: el anuncio
  // lleva a su tienda, y en los demás conjuntos esa tienda no aparece.
  const reachQuery = useQuery({
    queryKey: ["comercio-ads-reach", form.format, form.branchId],
    queryFn: () => getAdReach(form.format, form.branchId || undefined),
    enabled: isModalOpen,
  });

  // El total no se escribe: sale de los días por las veces al día. Con dos
  // campos sueltos se podía pedir 500 impresiones para 2 días aunque el
  // público no alcanzara a verlas.
  const days = Number(form.durationDays) || 0;
  const perDay = Number(form.dailyImpressions) || 0;
  const totalImpressions = days * perDay;

  const imagePreview = useMemo(
    () => (form.imageFile ? URL.createObjectURL(form.imageFile) : null),
    [form.imageFile],
  );

  useEffect(
    () => () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    },
    [imagePreview],
  );

  const quotePayload = useMemo(
    () => ({
      format: form.format,
      impressions: totalImpressions,
      durationDays: days,
      conjuntoIds: form.conjuntoIds.length ? form.conjuntoIds : undefined,
      audience: form.audience,
      branchId: form.branchId || undefined,
      extendedReach: form.extendedReach || undefined,
    }),
    [
      form.format,
      totalImpressions,
      days,
      form.conjuntoIds,
      form.audience,
      form.branchId,
      form.extendedReach,
    ],
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
    mutationFn: async () => {
      const imageFilename =
        form.imageFile && FORMATS_WITH_IMAGE.includes(form.format)
          ? (await uploadAdImage(form.imageFile)).imageFilename
          : undefined;

      return createAd({
        title: form.title,
        body: form.body || undefined,
        imageFilename,
        ctaLabel: form.ctaLabel || undefined,
        branchId: form.branchId || undefined,
        format: form.format,
        startsAt: new Date(form.startsAt).toISOString(),
        durationDays: days,
        impressions: totalImpressions,
        // El tope es el mismo ritmo elegido: así el paquete dura los días
        // pedidos y no se gasta entero el primero.
        dailyImpressionCap: perDay,
        conjuntoIds: form.conjuntoIds.length ? form.conjuntoIds : undefined,
        extendedReach: form.extendedReach || undefined,
        audience: form.audience,
        minOrders: Number(form.minOrders) || undefined,
        lapsedDays: Number(form.lapsedDays) || undefined,
      });
    },
    onSuccess: () => {
      showAlert("Anuncio creado como borrador. Págalo para ponerlo al aire.", "success");
      queryClient.invalidateQueries({ queryKey: ["comercio-ads"] });
      closeModal();
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const payMutation = useMutation({
    mutationFn: payAd,
    onSuccess: (paid) => {
      const charged = `$${Number(paid.amountCharged).toLocaleString()} con IVA`;
      showAlert(
        paid.creditApplied > 0
          ? `Pagado: ${charged}. $${Number(paid.creditApplied).toLocaleString()} salieron de tu saldo a favor.`
          : `Pagado: ${charged}. El anuncio ya está programado.`,
        "success",
      );
      queryClient.invalidateQueries({ queryKey: ["comercio-ads"] });
      queryClient.invalidateQueries({ queryKey: ["comercio-ads-credit"] });
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

  function pickImage(file: File | null) {
    if (file && file.size > MAX_IMAGE_MB * 1024 * 1024) {
      showAlert(`La imagen pesa más de ${MAX_IMAGE_MB} MB`, "error");
      return;
    }
    setForm((prev) => ({ ...prev, imageFile: file }));
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
  const creditBalance = creditQuery.data?.balance ?? 0;
  const reach = reachQuery.data ?? [];

  // Una vez por apartamento al día es el techo: más que eso no alcanza a
  // mostrarse y el servidor no deja guardar el borrador.
  const maxPerDay = quote?.maxDailyImpressions ?? 0;
  const overAudience = maxPerDay > 0 && perDay > maxPerDay;
  const minImpressions = pricing?.minImpressions ?? 0;
  const belowMinimum =
    days > 0 && perDay > 0 && totalImpressions < minImpressions;

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
    ad.extendedReach ? `${ad.title} · también sin suscripción` : ad.title,
    formatLabel[ad.format],
    `${new Date(ad.startsAt).toLocaleDateString()} → ${new Date(ad.endsAt).toLocaleDateString()}`,
    `${ad.impressionsServed.toLocaleString()} / ${ad.impressionsPurchased.toLocaleString()}`,
    String(ad.clicks),
    <div key={`money-${ad.id}`}>
      <span>
        ${Number(ad.totalAmount).toLocaleString()}
        {ad.taxRate > 0 && " + IVA"}
      </span>
      {ad.paymentStatus !== "PENDING" && ad.taxAmount > 0 && (
        <span className="block text-xs text-gray-500">
          Cobrado ${Number(ad.amountCharged).toLocaleString()} (IVA $
          {Number(ad.taxAmount).toLocaleString()})
        </span>
      )}
      {ad.creditApplied > 0 && (
        <span className="block text-xs text-gray-500">
          ${Number(ad.creditApplied).toLocaleString()} pagado con saldo
        </span>
      )}
      {ad.creditedAmount > 0 && (
        <span className="block text-xs text-emerald-700">
          ${Number(ad.creditedAmount).toLocaleString()} volvió como saldo
        </span>
      )}
    </div>,
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
      creditBalance={creditBalance}
      onPay={() => payMutation.mutate(ad.id)}
      onToggle={() =>
        toggleMutation.mutate({ id: ad.id, paused: ad.status === "PAUSED" })
      }
      onDelete={() => deleteMutation.mutate(ad.id)}
    />,
  ]);

  // Las celdas van en blanco como en el resto del panel: con el estilo por
  // defecto el texto gris oscuro quedaba sobre la tarjeta oscura y no se leía.
  const cellClasses = rows.map(() =>
    headers.map(() => "bg-white text-gray-700 px-3 py-2"),
  );

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Title as="h1" size="xs" colVariant="on" font="semi">
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
              ocurra primero. Si vence antes de gastarse, lo que no se mostró
              vuelve como saldo para tu próximo anuncio. Desde{" "}
              <strong>${pricing.cpmFeedCard.toLocaleString()}</strong> por cada
              1.000 impresiones en tarjeta.
            </Text>
          </div>
        )}

        {creditBalance > 0 && (
          <div className="mb-5 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4">
            <Text size="sm" className="text-emerald-200">
              Tienes <strong>${creditBalance.toLocaleString()}</strong> de saldo
              a favor. Se descuenta solo al pagar tu próximo anuncio.
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
            <Table
              headers={headers}
              rows={rows}
              cellClasses={cellClasses}
            />
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
                      {" "}Las {ad.creditedImpressions.toLocaleString()}{" "}
                      impresiones sin mostrar volvieron como saldo ($
                      {Number(ad.creditedAmount).toLocaleString()}) para tu
                      próximo anuncio.
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
            <Title as="h2" size="xs" className="text-xl" font="semi">
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
              // Los conjuntos marcados eran de la sucursal anterior.
              onChange={(e) =>
                setForm({ ...form, branchId: e.target.value, conjuntoIds: [] })
              }
              helpText="Sucursal que anuncia"
              sizeHelp="xs"
              inputSize="md"
              rounded="md"
            />

            <SelectField
              // El precio por mil al lado del nombre: es lo que explica por
              // qué la pantalla completa sale más cara por el mismo paquete.
              options={formatOptions.map((o) => ({
                label: pricing
                  ? `${o.label} · $${cpmFor(pricing, o.value).toLocaleString()} por mil`
                  : o.label,
                value: o.value,
              }))}
              value={form.format}
              onChange={(e) => {
                const format = e.target.value as AdFormat;
                setForm({
                  ...form,
                  format,
                  imageFile: FORMATS_WITH_IMAGE.includes(format)
                    ? form.imageFile
                    : null,
                });
              }}
              helpText={
                formatOptions.find((o) => o.value === form.format)?.hint ?? ""
              }
              sizeHelp="xs"
              inputSize="md"
              rounded="md"
            />

            {FORMATS_WITH_IMAGE.includes(form.format) && (
              <div className="rounded-xl border border-gray-200 p-3">
                <Text size="xs" className="text-gray-600">
                  Imagen (opcional). JPG, PNG o WEBP, hasta {MAX_IMAGE_MB} MB.
                  {form.format === "BANNER"
                    ? " En el banner se ve como miniatura cuadrada junto al título."
                    : " En pantalla completa va arriba, a todo el ancho."}
                </Text>

                {imagePreview ? (
                  <div className="mt-2 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imagePreview}
                      alt=""
                      className={
                        form.format === "BANNER"
                          ? "h-14 w-14 rounded-lg object-cover"
                          : "h-24 w-full max-w-xs rounded-lg object-cover"
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, imageFile: null })}
                      className="shrink-0 text-xs font-semibold text-red-600 hover:underline"
                    >
                      Quitar
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={(e) => pickImage(e.target.files?.[0] ?? null)}
                    className="mt-2 block w-full text-sm text-gray-700"
                  />
                )}
              </div>
            )}
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
                helpText="Duración en días"
                sizeHelp="xs"
                inputSize="md"
                rounded="md"
              />
              <InputField
                type="number"
                placeholder="Por día"
                value={form.dailyImpressions}
                onChange={(e) =>
                  setForm({ ...form, dailyImpressions: e.target.value })
                }
                helpText="Veces por día"
                sizeHelp="xs"
                inputSize="md"
                rounded="md"
              />
            </div>

            <div className="grid gap-1 rounded-xl border border-gray-200 px-3 py-2">
              <Text size="sm" className="text-gray-800">
                {totalImpressions > 0
                  ? `Se muestra ${totalImpressions.toLocaleString()} veces en total (${days} días × ${perDay.toLocaleString()} por día)`
                  : "Elige los días y las veces por día"}
              </Text>
              {maxPerDay > 0 && (
                <Text
                  size="xs"
                  className={overAudience ? "text-red-600" : "text-gray-500"}
                >
                  Tu público es de {maxPerDay.toLocaleString()} apartamentos:
                  caben como mucho {maxPerDay.toLocaleString()} veces por día.
                </Text>
              )}
              {belowMinimum && (
                <Text size="xs" className="text-amber-700">
                  La compra mínima es de {minImpressions.toLocaleString()}{" "}
                  veces: con {days} días, al menos{" "}
                  {Math.ceil(minImpressions / days).toLocaleString()} por día.
                </Text>
              )}
            </div>

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
            <Text size="sm" className="mb-2 text-gray-600">
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
                        ? "cursor-not-allowed border-gray-200 text-gray-400 line-through"
                        : selected
                          ? "border-cyan-500 bg-cyan-50 text-cyan-800"
                          : "border-gray-300 text-gray-700 hover:border-cyan-500",
                    ].join(" ")}
                  >
                    {conjunto.name}{" "}
                    <span className="opacity-60">({conjunto.plan})</span>
                  </button>
                );
              })}

              {reach.length === 0 && !reachQuery.isLoading && (
                <div className="flex flex-col gap-3 rounded-xl border border-amber-300 bg-amber-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <Text size="sm" className="text-amber-800">
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

            <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-3 hover:border-cyan-500">
              <input
                type="checkbox"
                className="mt-1"
                checked={form.extendedReach}
                onChange={(e) =>
                  setForm({ ...form, extendedReach: e.target.checked })
                }
              />
              <span>
                <Text size="sm" className="text-gray-800">
                  Llegar también a conjuntos cercanos donde no tengo
                  suscripción
                  {pricing
                    ? ` (+${Math.round(Number(pricing.surchargeExtendedReach ?? 0.5) * 100)}% solo sobre esa parte del público)`
                    : ""}
                </Text>
                <Text size="xs" className="text-gray-500">
                  Le llega a quien abra la app en cualquier conjunto a 40 km de
                  {form.branchId ? " esta sucursal" : " tus sucursales"}; no
                  eliges cuáles. Allí el residente ve la ficha de tu comercio
                  (dirección y teléfono), no tu tienda: para venderle tienes que
                  suscribirte a su conjunto.
                </Text>
              </span>
            </label>
          </div>

          {/* ── Cotización ─────────────────────────────────────────────── */}
          <div className="md:col-span-2 rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
            {quoteMutation.isPending && !quote ? (
              <Text size="sm" className="text-gray-500">
                Calculando...
              </Text>
            ) : quoteMutation.isError ? (
              <Text size="sm" colVariant="danger">
                {(quoteMutation.error as Error).message}
              </Text>
            ) : quote ? (
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <Text size="xs" className="text-gray-500">
                    Total a pagar
                  </Text>
                  <Title
                    as="h3"
                    size="xs"
                    className="text-lg"
                    font="semi"
                  >
                    ${quote.totalWithTax.toLocaleString()} {quote.currency}
                  </Title>
                  {quote.taxAmount > 0 && (
                    <Text size="xs" className="text-gray-500">
                      ${quote.totalAmount.toLocaleString()} + IVA (
                      {Math.round(quote.taxRate * 100)}%) $
                      {quote.taxAmount.toLocaleString()}
                    </Text>
                  )}
                  <Text size="xs" className="text-gray-500">
                    ${quote.cpm.toLocaleString()} por mil
                    {quote.targetingSurcharge - (quote.extendedReachSurcharge ?? 0) > 0 &&
                      ` · +${Math.round((quote.targetingSurcharge - (quote.extendedReachSurcharge ?? 0)) * 100)}% por segmentar`}
                    {(quote.extendedReachSurcharge ?? 0) > 0 &&
                      ` · +${Math.round(quote.extendedReachSurcharge * 100)}% por conjuntos sin suscripción (el ${Math.round((quote.extendedReachShare ?? 0) * 100)}% de tu público)`}
                  </Text>
                  {creditBalance > 0 && (
                    <Text size="xs" className="text-emerald-700">
                      Con tu saldo pagas $
                      {withIva(
                        Math.max(0, quote.totalAmount - creditBalance),
                        quote.taxRate,
                      ).toLocaleString()}{" "}
                      con IVA: el saldo se descuenta antes del impuesto
                    </Text>
                  )}
                </div>

                <div>
                  <Text size="xs" className="text-gray-500">
                    Le llega a
                  </Text>
                  <Title
                    as="h3"
                    size="xs"
                    className="text-lg"
                    font="semi"
                  >
                    {quote.reach.apartments.toLocaleString()} apartamentos
                  </Title>
                  <Text size="xs" className="text-gray-500">
                    en {quote.reach.eligibleConjuntos} conjunto(s)
                    {(quote.reach.outsideConjuntos ?? 0) > 0 &&
                      `, ${quote.reach.outsideConjuntos} sin suscripción`}
                  </Text>
                </div>

                <div>
                  <Text size="xs" className="text-gray-500">
                    Se muestra
                  </Text>
                  <Title
                    as="h3"
                    size="xs"
                    className="text-lg"
                    font="semi"
                  >
                    {quote.impressions.toLocaleString()} veces
                  </Title>
                  <Text size="xs" className="text-gray-500">
                    {quote.suggestedDailyCap.toLocaleString()} por día durante{" "}
                    {quote.durationDays} días
                  </Text>
                </div>

                {quote.notes.length > 0 && (
                  <div className="md:col-span-3 grid gap-1">
                    {quote.notes.map((note) => (
                      <Text key={note} size="xs" className="text-amber-700">
                        {note}
                      </Text>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Text size="sm" className="text-gray-500">
                Completa la duración y las veces por día para ver el precio y el
                alcance.
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
              disabled={createMutation.isPending || !quote || overAudience}
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
  creditBalance,
  onPay,
  onToggle,
  onDelete,
}: {
  ad: AdCampaign;
  creditBalance: number;
  onPay: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  if (ad.status === "DRAFT") {
    // El servidor gasta primero el saldo y suma el IVA a lo que queda; el
    // botón dice eso, lo que de verdad se va a cobrar.
    const toCharge = withIva(
      Math.max(0, Number(ad.totalAmount) - creditBalance),
      Number(ad.taxRate ?? 0),
    );

    return (
      <div className="flex gap-2">
        <Button size="xs" rounded="md" colVariant="success" onClick={onPay}>
          {toCharge === 0
            ? "Pagar con saldo"
            : `Pagar $${toCharge.toLocaleString()}`}
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
