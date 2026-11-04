"use client";

import React from "react";
import { ImSpinner9 } from "react-icons/im";
import {
  HistoryRelation,
  UnitHistoryResponse,
} from "../../services/response/warningResponse";

/**
 * yyyy-mm-dd (o un ISO de medianoche UTC) → dd/mm/yyyy, sin pasar por la
 * zona horaria: en Bogotá un `new Date("2026-11-10")` se muestra como el 9.
 */
export function formatDay(value?: string | null): string {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : "";
}

/** Un instante real (createdAt) en hora de Bogotá. */
function formatCreated(value: string): string {
  return new Date(value).toLocaleDateString("es-CO", {
    timeZone: "America/Bogota",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function personName(relation?: HistoryRelation): string {
  const user = relation?.user;
  const full = [user?.name, user?.lastName].filter(Boolean).join(" ");
  return full || relation?.namesuer || "";
}

const money = (value: number | string) =>
  `$${Number(value || 0).toLocaleString("es-CO")}`;

const FINE_STATUS: Record<string, { label: string; tone: string }> = {
  notified: { label: "Notificada", tone: "border-amber-300 bg-amber-50 text-amber-800" },
  pending: { label: "Pendiente", tone: "border-amber-300 bg-amber-50 text-amber-800" },
  paid: { label: "Pagada", tone: "border-emerald-300 bg-emerald-50 text-emerald-800" },
  cancelled: { label: "Anulada", tone: "border-slate-200 bg-slate-100 text-slate-500" },
  appealed: { label: "Apelada", tone: "border-cyan-300 bg-cyan-50 text-cyan-800" },
};

function Pill({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${tone}`}>
      {children}
    </span>
  );
}

interface Props {
  history?: UnitHistoryResponse;
  isLoading: boolean;
  onCancelWarning?: (id: string) => void;
  cancellingId?: string | null;
}

/**
 * Llamados de atención y multas de la unidad. Va dentro del modal, que es
 * siempre blanco: solo colores claros, sin pares `dark:`.
 */
export default function UnitDisciplineHistory({
  history,
  isLoading,
  onCancelWarning,
  cancellingId,
}: Props) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
        <ImSpinner9 className="animate-spin" /> Revisando el historial de la unidad…
      </div>
    );
  }

  if (!history) return null;

  const { warnings, fines } = history;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold text-slate-900">
          Historial de la unidad {history.unit}
        </p>
        <p className="text-xs text-slate-500">
          {history.activeWarnings} llamado{history.activeWarnings === 1 ? "" : "s"} de
          atención · {fines.filter((f) => f.status !== "cancelled").length} multa
          {fines.filter((f) => f.status !== "cancelled").length === 1 ? "" : "s"}
        </p>
      </div>

      {warnings.length === 0 && fines.length === 0 ? (
        <p className="mt-2 text-sm text-slate-600">
          Sin llamados de atención ni multas registradas.
        </p>
      ) : (
        <ul className="mt-2 max-h-56 space-y-2 overflow-y-auto pr-1">
          {warnings.map((warning) => {
            const cancelled = warning.status === "cancelled";
            const who = personName(warning.relation);
            return (
              <li
                key={`w-${warning.id}`}
                className={`rounded-lg border border-slate-200 bg-white p-2 text-sm ${cancelled ? "opacity-60" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">
                      Llamado de atención: {warning.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatCreated(warning.createdAt)}
                      {who ? ` · ${who}` : ""}
                      {warning.correctionDeadline
                        ? ` · plazo para corregir: ${formatDay(warning.correctionDeadline)}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Pill
                      tone={
                        cancelled
                          ? "border-slate-200 bg-slate-100 text-slate-500"
                          : "border-amber-300 bg-amber-50 text-amber-800"
                      }
                    >
                      {cancelled ? "Anulado" : "Enviado"}
                    </Pill>
                    {!cancelled && onCancelWarning && (
                      <button
                        type="button"
                        className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                        disabled={cancellingId === warning.id}
                        onClick={() => onCancelWarning(warning.id)}
                      >
                        Anular
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}

          {fines.map((fine) => {
            const status = FINE_STATUS[fine.status] ?? FINE_STATUS.notified;
            const who = personName(fine.relation);
            return (
              <li
                key={`f-${fine.id}`}
                className="rounded-lg border border-slate-200 bg-white p-2 text-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">
                      Multa: {fine.title} · {money(fine.amount)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatCreated(fine.createdAt)}
                      {who ? ` · ${who}` : ""}
                      {fine.warningId ? " · tras llamado de atención" : " · sin llamado previo"}
                    </p>
                  </div>
                  <Pill tone={status.tone}>{status.label}</Pill>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
