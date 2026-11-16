/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { formatCurrency } from "@/app/_helpers/format-currency";

/**
 * Daños que el anfitrión reporta al recibir el inmueble, contra el depósito.
 * Lo devuelven `GET /api/booking/owner/bookings` (anfitrión) y
 * `GET /api/booking/my-bookings` (huésped).
 */
export type DamageClaimView = {
  id: string;
  /** `open`: la plataforma todavía no decide. */
  estado: "open" | "approved" | "partial" | "rejected";
  /** Lo que pidió retener el anfitrión. */
  monto: number;
  descripcion: string;
  /** Cuántas fotos tiene; se piden una a una por el endpoint privado. */
  fotos: number;
  respuestaHuesped: string | null;
  respondidoEl: string | null;
  /** Lo que la plataforma aprobó retener; null mientras está abierto. */
  montoAprobado: number | null;
  notaEmpresa: string | null;
  creadoEn: string;
  resueltoEl: string | null;
};

const CLAIM_LABEL: Record<DamageClaimView["estado"], string> = {
  open: "En revisión por la plataforma",
  approved: "Aprobado",
  partial: "Aprobado en parte",
  rejected: "Rechazado",
};

const CLAIM_STYLE: Record<DamageClaimView["estado"], string> = {
  open: "bg-amber-100 text-amber-800",
  approved: "bg-red-100 text-red-700",
  partial: "bg-orange-100 text-orange-800",
  rejected: "bg-emerald-100 text-emerald-700",
};

/**
 * Las fotos salen por un endpoint con sesión (son del interior de una
 * vivienda): un `<img src>` no manda el token, así que se bajan como blob.
 */
function useClaimPhotos(bookingId: string, count: number) {
  const [urls, setUrls] = useState<string[]>([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!count) return;

    let cancelled = false;
    const created: string[] = [];

    (async () => {
      try {
        const loaded = await Promise.all(
          Array.from({ length: count }, async (_, index) => {
            const res = await fetchWithAuth(
              `${process.env.NEXT_PUBLIC_API_URL}/api/booking/${bookingId}/damage-claim/photos/${index}`,
            );
            if (!res.ok) throw new Error("foto");
            const url = URL.createObjectURL(await res.blob());
            created.push(url);
            return url;
          }),
        );
        if (!cancelled) setUrls(loaded);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      created.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [bookingId, count]);

  return { urls, failed };
}

export function DamageClaimPhotos({
  bookingId,
  count,
}: {
  bookingId: string;
  count: number;
}) {
  const { urls, failed } = useClaimPhotos(bookingId, count);

  if (!count) return null;
  if (failed) {
    return <p className="text-xs text-red-600">No se pudieron cargar las fotos.</p>;
  }
  if (!urls.length) {
    return <p className="text-xs text-slate-500">Cargando fotos…</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {urls.map((url, i) => (
        <button
          key={url}
          type="button"
          onClick={() => window.open(url, "_blank")}
          title="Ver foto completa"
        >
          <img
            src={url}
            alt={`Daño ${i + 1}`}
            className="h-16 w-16 rounded-md border border-slate-200 object-cover hover:opacity-80"
          />
        </button>
      ))}
    </div>
  );
}

/**
 * El reporte de daños con su estado, fotos, la versión del huésped y lo que
 * decidió la plataforma. Fondo claro: va dentro de tarjetas y modales blancos.
 */
export function DamageClaimSummary({
  bookingId,
  claim,
  audience,
  covered = false,
}: {
  bookingId: string;
  claim: DamageClaimView;
  audience: "host" | "guest";
  /** El huésped tomó la protección: lo aprobado lo paga la plataforma. */
  covered?: boolean;
}) {
  return (
    <div className="mt-2 space-y-2 rounded-lg border border-amber-200 bg-amber-50/60 p-2 text-xs text-slate-700">
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-slate-900">
          {audience === "host" ? "Daños que reportaste" : "Daños reportados por el anfitrión"}
        </span>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${CLAIM_STYLE[claim.estado]}`}
        >
          {CLAIM_LABEL[claim.estado]}
        </span>
      </div>

      <p>
        {covered ? "Reporta daños por " : "Pide retener "}
        <strong>{formatCurrency(claim.monto)}</strong>
        {covered ? "." : " del depósito."}
      </p>
      {covered && audience === "guest" && (
        <p className="font-semibold text-emerald-700">
          Tu protección de daños lo cubre: no tienes que pagar nada.
        </p>
      )}
      <p className="whitespace-pre-line text-slate-600">{claim.descripcion}</p>

      <DamageClaimPhotos bookingId={bookingId} count={claim.fotos} />

      {claim.respuestaHuesped && (
        <div className="rounded-md bg-white p-2">
          <p className="font-semibold text-slate-800">
            {audience === "guest" ? "Tu versión" : "Versión del huésped"}
          </p>
          <p className="whitespace-pre-line text-slate-600">{claim.respuestaHuesped}</p>
        </div>
      )}

      {claim.estado !== "open" && (
        <div className="rounded-md bg-white p-2">
          <p className="font-semibold text-slate-800">
            Decisión de la plataforma:{" "}
            {covered ? "se le pagan al anfitrión " : "se retienen "}
            {formatCurrency(claim.montoAprobado ?? 0)}
            {covered ? " con la protección" : ""}
          </p>
          {claim.notaEmpresa && (
            <p className="whitespace-pre-line text-slate-600">{claim.notaEmpresa}</p>
          )}
        </div>
      )}
    </div>
  );
}
