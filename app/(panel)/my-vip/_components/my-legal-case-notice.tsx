"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { MdGavel } from "react-icons/md";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  LegalCaseStatus,
  LegalCollectionService,
} from "@/app/(panel)/my-fees/services/legalCollectionService";

const money = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value || 0);

/** Más rojo cuanto más avanzado el proceso, igual que en el panel de cobro. */
const TONE: Partial<Record<LegalCaseStatus, string>> = {
  PREJURIDICO:
    "border-amber-300 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10",
  JURIDICO:
    "border-orange-300 bg-orange-50 dark:border-orange-500/30 dark:bg-orange-500/10",
  DEMANDADO: "border-red-300 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10",
  ACUERDO:
    "border-emerald-300 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10",
};

const ICON: Partial<Record<LegalCaseStatus, string>> = {
  PREJURIDICO: "text-amber-600 dark:text-amber-300",
  JURIDICO: "text-orange-600 dark:text-orange-300",
  DEMANDADO: "text-red-600 dark:text-red-300",
  ACUERDO: "text-emerald-600 dark:text-emerald-300",
};

/**
 * El cobro de cartera del residente: en qué etapa está, cuánto debe hoy y con
 * quién arreglar.
 *
 * Antes el residente solo recibía un push al abrirse el caso y en su perfil no
 * había nada: si lo perdía, no sabía que estaba en cobro jurídico hasta que le
 * llegaba la demanda. El texto lo arma el backend, el mismo del correo.
 */
export default function MyLegalCaseNotice() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const { data = [], isLoading } = useQuery({
    // Clave propia: compartirla con otra consulta mezcla las respuestas.
    queryKey: ["my-legal-case", conjuntoId],
    queryFn: () => LegalCollectionService.mine(String(conjuntoId)),
    enabled: !!conjuntoId,
    retry: false,
    refetchOnWindowFocus: false,
  });

  if (isLoading || data.length === 0) return null;

  return (
    <>
      {data.map((item) => (
        <div
          key={item.id}
          className={`mb-4 rounded-lg border p-4 ${TONE[item.status] ?? TONE.PREJURIDICO}`}
        >
          <div className="flex items-start gap-2">
            <MdGavel
              className={`mt-0.5 shrink-0 text-lg ${ICON[item.status] ?? ICON.PREJURIDICO}`}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {item.title}
                </p>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                  {item.statusLabel}
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                {item.message}
              </p>

              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                <span>
                  Saldo hoy:{" "}
                  <strong className="text-slate-900 dark:text-slate-100">
                    {money(item.outstanding)}
                  </strong>
                </span>
                <span>
                  En cobro desde el{" "}
                  {new Date(item.openedAt).toLocaleDateString("es-CO", {
                    timeZone: "America/Bogota",
                  })}
                </span>
                {item.unit && <span>Unidad {item.unit}</span>}
              </div>

              {(item.lawyer?.name || item.externalCaseRef) && (
                <div className="mt-3 rounded-md border border-slate-200 bg-white p-3 text-sm dark:border-white/10 dark:bg-white/[0.04]">
                  {item.lawyer?.name && (
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      Abogado: {item.lawyer.name}
                    </p>
                  )}
                  {(item.lawyer?.email || item.lawyer?.phone) && (
                    <p className="mt-0.5 flex flex-wrap gap-x-4 text-xs text-slate-600 dark:text-slate-300">
                      {item.lawyer?.email && (
                        <a
                          href={`mailto:${item.lawyer.email}`}
                          className="text-cyan-700 hover:underline dark:text-cyan-300"
                        >
                          {item.lawyer.email}
                        </a>
                      )}
                      {item.lawyer?.phone && (
                        <a
                          href={`tel:${item.lawyer.phone}`}
                          className="text-cyan-700 hover:underline dark:text-cyan-300"
                        >
                          {item.lawyer.phone}
                        </a>
                      )}
                    </p>
                  )}
                  {item.externalCaseRef && (
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                      Radicado: {item.externalCaseRef}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
