"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  PlatformCharge,
  PlatformChargeConcept,
  PlatformChargesApi,
} from "./platform-charge-api";

/**
 * `auto`: el panel del conjunto, claro con su variante oscura.
 * `dark`: el panel del comercio, que es oscuro siempre.
 * `light`: dentro del Modal de la librería o de paneles que son claros siempre.
 */
export type ChargeTone = "auto" | "dark" | "light";

const BASE_TONES: Record<
  Exclude<ChargeTone, "light">,
  Record<
    "card" | "title" | "text" | "muted" | "box" | "input" | "primary" | "ghost" | "danger" | "warn" | "ok",
    string
  >
> = {
  auto: {
    card: "rounded-xl border border-violet-200 bg-white p-4 dark:border-violet-500/30 dark:bg-slate-900",
    title: "text-sm font-semibold text-gray-900 dark:text-slate-100",
    text: "text-sm text-gray-700 dark:text-slate-300",
    muted: "text-xs text-gray-500 dark:text-slate-400",
    box: "rounded-lg bg-violet-50 p-3 dark:bg-violet-500/10",
    input:
      "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none dark:border-white/15 dark:bg-slate-950 dark:text-slate-100",
    primary:
      "rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50",
    ghost:
      "rounded-md border border-violet-300 px-2 py-1 text-xs text-violet-800 hover:bg-violet-100 dark:border-violet-400/40 dark:text-violet-200 dark:hover:bg-violet-500/10",
    danger:
      "text-xs text-red-600 underline disabled:opacity-50 dark:text-red-400",
    warn: "rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200",
    ok: "rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200",
  },
  dark: {
    card: "rounded-2xl border border-violet-500/30 bg-violet-500/[0.06] p-4",
    title: "text-sm font-semibold text-slate-100",
    text: "text-sm text-slate-300",
    muted: "text-xs text-slate-400",
    box: "rounded-lg bg-white/[0.04] p-3",
    input:
      "w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-violet-400 focus:outline-none",
    primary:
      "rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50",
    ghost:
      "rounded-md border border-violet-400/40 px-2 py-1 text-xs text-violet-200 hover:bg-violet-500/10",
    danger: "text-xs text-red-400 underline disabled:opacity-50",
    warn: "rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200",
    ok: "rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200",
  },
};

/** El claro es el del panel sin las variantes oscuras. */
const TONES: Record<ChargeTone, (typeof BASE_TONES)["auto"]> = {
  ...BASE_TONES,
  light: Object.fromEntries(
    Object.entries(BASE_TONES.auto).map(([key, value]) => [
      key,
      value
        .split(" ")
        .filter((cls) => !cls.startsWith("dark:"))
        .join(" "),
    ]),
  ) as (typeof BASE_TONES)["auto"],
};

const KEY_LABEL: Record<string, string> = {
  negocio: "Llave de negocio",
  nit: "NIT",
  alfanumerica: "Llave",
  correo: "Correo",
  celular: "Celular",
  cedula: "Cédula",
};

const money = (value: number, currency: string) =>
  `$${Math.round(value).toLocaleString("es-CO")} ${currency}`;

const date = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("es-CO", {
        timeZone: "America/Bogota",
        day: "numeric",
        month: "short",
      })
    : "";

/**
 * Un cobro de la plataforma pagado por Bre-B: a dónde pagar, la referencia,
 * subir el comprobante y en qué va la verificación.
 */
export default function PlatformChargePanel({
  charge,
  api,
  tone = "auto",
  onChanged,
}: {
  charge: PlatformCharge;
  api: PlatformChargesApi;
  tone?: ChargeTone;
  onChanged?: (charge: PlatformCharge) => void;
}) {
  const t = TONES[tone];
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const done = (updated: PlatformCharge) => {
    setError(null);
    queryClient.invalidateQueries({ queryKey: ["platform-charges", api.scope] });
    onChanged?.(updated);
  };

  const report = useMutation({
    mutationFn: () => api.report(charge.id, { file: file as File, transactionId }),
    onSuccess: (updated) => {
      setFile(null);
      setTransactionId("");
      done(updated);
    },
    onError: (e: Error) => setError(e.message),
  });

  const cancel = useMutation({
    mutationFn: () => api.cancel(charge.id),
    onSuccess: done,
    onError: (e: Error) => setError(e.message),
  });

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(value);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Sin portapapeles el dato sigue visible y seleccionable.
    }
  };

  const canPay = charge.status === "awaiting_payment" || charge.status === "rejected";
  const breB = charge.instructions;

  return (
    <div className={`${t.card} flex flex-col gap-3`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className={t.title}>{charge.description}</p>
          <p className={t.muted}>Referencia {charge.reference}</p>
        </div>
        <div className="text-right">
          <p className={t.title}>{money(charge.total, charge.currency)}</p>
          {charge.taxAmount > 0 && (
            <p className={t.muted}>IVA incluido {money(charge.taxAmount, charge.currency)}</p>
          )}
        </div>
      </div>

      {charge.status === "in_review" && (
        <div className={t.ok}>
          Recibimos tu comprobante{charge.reportedAt ? ` del ${date(charge.reportedAt)}` : ""}.
          Lo verificamos y queda activo apenas confirmemos el pago; no tienes que
          hacer nada más.
        </div>
      )}

      {charge.status === "rejected" && (
        <div className={t.warn}>
          No pudimos confirmar el pago
          {charge.rejectionReason ? `: ${charge.rejectionReason}` : "."} Si ya
          pagaste, sube el comprobante correcto.
        </div>
      )}

      {charge.status === "paid" && (
        <div className={t.ok}>Pago confirmado {date(charge.paidAt)}. Ya está activo.</div>
      )}

      {(charge.status === "expired" || charge.status === "cancelled") && (
        <div className={t.warn}>
          {charge.status === "expired"
            ? "Este cobro venció sin comprobante."
            : "Cancelaste este cobro."}{" "}
          Si quieres pagar, vuelve a pedirlo.
        </div>
      )}

      {canPay && breB && (
        <div className={`${t.box} flex flex-col gap-2`}>
          <p className={t.text}>
            1. Desde la app de tu banco, paga por <strong>Bre-B</strong> a esta
            llave{breB.qrUrl ? " o escanea el QR" : ""}:
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className={t.muted}>{KEY_LABEL[breB.keyType] ?? "Llave"}</span>
            <span className={`${t.title} font-mono text-base break-all`}>{breB.key}</span>
            <button type="button" className={t.ghost} onClick={() => copy(breB.key)}>
              {copied === breB.key ? "Copiada" : "Copiar"}
            </button>
          </div>
          {breB.qrUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={breB.qrUrl}
              alt="QR de Bre-B de la plataforma"
              className="h-36 w-36 self-center rounded-md bg-white object-contain p-1"
            />
          )}
          <p className={t.text}>
            Tu banco debe mostrar como destinatario:{" "}
            <strong>{breB.holderName}</strong>. Si aparece otro nombre, no pagues.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className={t.text}>2. En la descripción escribe:</span>
            <span className={`${t.title} font-mono`}>{charge.reference}</span>
            <button type="button" className={t.ghost} onClick={() => copy(charge.reference)}>
              {copied === charge.reference ? "Copiada" : "Copiar"}
            </button>
          </div>
          <p className={t.text}>
            3. Paga exactamente {money(charge.total, charge.currency)} y sube el
            comprobante aquí abajo
            {charge.expiresAt ? ` antes del ${date(charge.expiresAt)}` : ""}.
          </p>
        </div>
      )}

      {canPay && (
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1">
            <span className={t.muted}>Comprobante (foto o PDF)</span>
            <input
              type="file"
              accept="image/*,application/pdf"
              className="text-sm"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className={t.muted}>N.º de la transacción (opcional)</span>
            <input
              className={t.input}
              value={transactionId}
              maxLength={100}
              onChange={(e) => setTransactionId(e.target.value)}
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className={t.primary}
              disabled={!file || report.isPending}
              onClick={() => report.mutate()}
            >
              {report.isPending ? "Enviando…" : "Enviar comprobante"}
            </button>
            <button
              type="button"
              className={t.danger}
              disabled={cancel.isPending}
              onClick={() => {
                if (window.confirm("¿Cancelar este cobro?")) cancel.mutate();
              }}
            >
              Cancelar cobro
            </button>
          </div>
        </div>
      )}

      {charge.hasProof && (
        <button
          type="button"
          className={`${t.ghost} self-start`}
          onClick={() => api.openProof(charge.id).catch((e: Error) => setError(e.message))}
        >
          Ver comprobante enviado
        </button>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

/**
 * Los cobros abiertos de un concepto (esperando pago, en revisión o
 * rechazados), para retomarlos al volver a la pantalla de pago. Sin nada
 * abierto no pinta nada.
 */
export function PendingPlatformCharges({
  api,
  concept,
  tone = "auto",
  title = "Pagos pendientes",
  onChanged,
}: {
  api: PlatformChargesApi;
  concept?: PlatformChargeConcept;
  tone?: ChargeTone;
  title?: string;
  /** Para refrescar lo apartado (ej.: cancelar suelta el saldo o el cupo). */
  onChanged?: (charge: PlatformCharge) => void;
}) {
  const t = TONES[tone];
  const { data } = useQuery({
    queryKey: ["platform-charges", api.scope, concept ?? "all"],
    queryFn: () => api.list(concept),
  });

  const open = (data ?? []).filter((c) =>
    ["awaiting_payment", "in_review", "rejected"].includes(c.status),
  );

  if (!open.length) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className={t.title}>{title}</p>
      {open.map((charge) => (
        <PlatformChargePanel
          key={charge.id}
          charge={charge}
          api={api}
          tone={tone}
          onChanged={onChanged}
        />
      ))}
    </div>
  );
}
