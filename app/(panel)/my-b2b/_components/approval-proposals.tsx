"use client";

import { ReactNode } from "react";
import { HiCheckBadge, HiOutlineExclamationTriangle } from "react-icons/hi2";
import { IoStar } from "react-icons/io5";
import {
  B2bApprovalItem,
  proposalPrice,
} from "../services/b2bApprovalService";
import { Pill, fmtMoney, ui } from "./b2b-ui";
import { GroupProgress } from "./group-progress";

interface Props {
  items: B2bApprovalItem[];
  /** Acción por propuesta (el presidente elige desde aquí). */
  action?: (item: B2bApprovalItem) => ReactNode;
}

const SOURCE_LABEL: Record<B2bApprovalItem["source"], string> = {
  quote: "Cotización",
  plan: "Plan del catálogo",
  renewal: "Proveedor actual",
};

/**
 * La propuesta más económica, solo si todas se pueden comparar directo: mismo
 * tipo de cobro y misma periodicidad. Una obra de pago único contra un
 * servicio mensual no tiene "más barata".
 */
function cheapestId(items: B2bApprovalItem[]) {
  if (items.length < 2) return null;
  const first = items[0];
  const comparable = items.every(
    (i) =>
      i.isRecurring === first.isRecurring &&
      (!i.isRecurring || i.billingPeriod === first.billingPeriod),
  );
  if (!comparable) return null;

  const sorted = [...items].sort((a, b) => a.amount - b.amount);
  return sorted[0].amount < sorted[1].amount ? sorted[0].id : null;
}

/**
 * El cuadro comparativo: cada propuesta con su proveedor, el sello de
 * documentos al día, su calificación, el precio y el alcance. Es lo que el
 * consejo o el presidente necesita para decidir sin pedirle el Excel a la
 * administración.
 */
export function ApprovalProposals({ items, action }: Props) {
  const cheapest = cheapestId(items);

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <article
          key={item.id}
          className={`relative flex flex-col rounded-2xl border p-4 transition ${
            item.available === false && !item.chosen ? "opacity-60 " : ""
          }${
            item.chosen
              ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20 dark:bg-emerald-500/10"
              : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.03]"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-600 text-xs font-bold text-white">
                {item.position}
              </span>
              <span className={`truncate font-semibold ${ui.strong}`}>
                {item.comercioName ?? "Proveedor"}
              </span>
            </div>
            {item.chosen ? (
              <Pill tone="success">Elegida</Pill>
            ) : item.available === false ? (
              <Pill tone="neutral">Ya no disponible</Pill>
            ) : cheapest === item.id ? (
              <Pill tone="info">Más económica</Pill>
            ) : null}
          </div>

          <p className={`mt-1 text-xs ${ui.muted}`}>
            {SOURCE_LABEL[item.source]}
            {item.quoteNumber ? ` · ${item.quoteNumber}` : ""} · {item.name}
          </p>

          <div className="mt-3">
            <p className={`text-2xl font-bold tracking-tight ${ui.strong}`}>
              {proposalPrice(item)}
            </p>
            {item.pricingModel === "por_apartamento" && item.quantityapt ? (
              <p className={`text-xs ${ui.faint}`}>
                {fmtMoney(item.price, item.currency)} por apartamento ×{" "}
                {item.quantityapt}
              </p>
            ) : null}
            {item.previousAmount != null && item.changePercent != null ? (
              <p
                className={`mt-0.5 text-xs font-semibold ${
                  item.changePercent > 0
                    ? "text-amber-700 dark:text-amber-300"
                    : "text-emerald-700 dark:text-emerald-300"
                }`}
              >
                {item.changePercent > 0 ? "▲ +" : "▼ "}
                {item.changePercent}% frente a lo que paga hoy (
                {fmtMoney(item.previousAmount, item.currency)})
              </p>
            ) : null}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            {item.verified ? (
              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                <HiCheckBadge size={15} /> Documentos al día
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300">
                <HiOutlineExclamationTriangle size={14} /> Documentos incompletos
              </span>
            )}
            <span className={`inline-flex items-center gap-1 ${ui.muted}`}>
              <IoStar className="text-amber-400" />
              {item.rating
                ? `${item.rating.average} (${item.rating.count})`
                : "Sin calificaciones"}
            </span>
            {item.termMonths ? (
              <span className={ui.muted}>· {item.termMonths} meses</span>
            ) : null}
          </div>

          {item.group ? (
            <div className="mt-3 space-y-1">
              <GroupProgress group={item.group} compact />
              <p className={`text-xs ${ui.muted}`}>
                Es el precio techo: si al cierre aprueban más conjuntos, baja
                para todos.
              </p>
            </div>
          ) : null}

          {item.scope ? (
            <details className="group mt-3">
              <summary className={`cursor-pointer text-xs font-semibold ${ui.link}`}>
                Ver alcance
              </summary>
              <p className={`mt-1 whitespace-pre-line text-xs ${ui.text}`}>
                {item.scope}
              </p>
            </details>
          ) : null}

          {item.available === false && !item.chosen && item.unavailableReason ? (
            <p className={`mt-3 text-xs ${ui.muted}`}>{item.unavailableReason}</p>
          ) : null}

          {action && item.available !== false ? (
            <div className="mt-auto pt-4">{action(item)}</div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

/** Resultado de la votación del consejo, opción por opción. */
export function CouncilTally({ tally }: { tally: { label: string; votes: number }[] }) {
  const total = tally.reduce((sum, t) => sum + t.votes, 0);
  const top = Math.max(...tally.map((t) => t.votes), 0);

  return (
    <div className="space-y-2">
      {tally.map((row) => {
        const winner = row.votes === top && top > 0;
        return (
          <div key={row.label}>
            <div className={`flex justify-between gap-3 text-xs ${ui.text}`}>
              <span className={`truncate ${winner ? "font-semibold" : ""}`}>
                {row.label}
              </span>
              <span className="shrink-0 font-semibold">
                {row.votes} voto{row.votes === 1 ? "" : "s"}
              </span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-slate-200 dark:bg-white/10">
              <div
                className={`h-2 rounded-full ${winner ? "bg-cyan-600" : "bg-slate-400 dark:bg-slate-500"}`}
                style={{ width: total ? `${(row.votes / total) * 100}%` : "0%" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
