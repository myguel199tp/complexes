"use client";

import { HiOutlineUserGroup } from "react-icons/hi2";
import type { B2bGroupProgress } from "../services/b2bDemandService";
import { Pill, fmtDate, fmtMoney, ui } from "./b2b-ui";

const UNIT: Record<B2bGroupProgress["pricingModel"], string> = {
  por_apartamento: " por apto",
  fijo: "",
};

const STATUS: Record<B2bGroupProgress["status"], { tone: "info" | "success" | "warning"; label: string }> = {
  open: { tone: "info", label: "Decidiendo" },
  succeeded: { tone: "success", label: "Cerró con trato" },
  failed: { tone: "warning", label: "No alcanzó el mínimo" },
};

/**
 * Cómo va una compra en grupo: los escalones con el alcanzado resaltado,
 * cuánto falta para el siguiente y hasta cuándo se decide.
 *
 * Es lo que convierte "súmate" en algo concreto para un consejo: si tres
 * conjuntos más aprueban, todos pagan menos. `compact` es la versión de una
 * línea para las tarjetas de listas.
 */
export function GroupProgress({
  group,
  compact = false,
}: {
  group: B2bGroupProgress;
  compact?: boolean;
}) {
  const unit = UNIT[group.pricingModel];
  const tiers = [...group.tiers].sort((a, b) => a.minApartments - b.minApartments);
  const open = group.status === "open";
  const reachedPrice = group.finalPrice ?? group.currentPrice;
  const top = tiers[tiers.length - 1]?.minApartments || 1;
  const fill = Math.min(100, (group.acceptedApartments / Math.max(top, 1)) * 100);

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <span className="inline-flex items-center gap-1 font-semibold text-cyan-700 dark:text-cyan-300">
          <HiOutlineUserGroup size={14} /> Compra en grupo
        </span>
        <span className={ui.muted}>
          {group.acceptedConjuntos} de {group.invitedConjuntos} conjuntos aprobaron
        </span>
        {open ? (
          <span className={group.daysLeft <= 7 ? "font-semibold text-amber-700 dark:text-amber-300" : ui.muted}>
            {group.daysLeft > 0
              ? `decide hasta el ${fmtDate(group.decisionDeadline, true)}`
              : "cierra hoy"}
          </span>
        ) : (
          <Pill tone={STATUS[group.status].tone}>{STATUS[group.status].label}</Pill>
        )}
      </div>
    );
  }

  return (
    <div className={`${ui.subtle} p-4`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-700 dark:text-cyan-300">
            <HiOutlineUserGroup size={16} /> Compra en grupo
          </p>
          <p className={`text-xs ${ui.muted}`}>
            {open
              ? `Cada conjunto decide con su consejo o su presidente hasta el ${fmtDate(group.decisionDeadline, true)}${
                  group.daysLeft > 0 ? ` (faltan ${group.daysLeft} días)` : " (cierra hoy)"
                }.`
              : `Cerró el ${fmtDate(group.decisionDeadline, true)}.`}
          </p>
        </div>
        <Pill tone={STATUS[group.status].tone}>{STATUS[group.status].label}</Pill>
      </div>

      {/* Escalones: el alcanzado resaltado, los demás como meta. */}
      <ol className="mt-3 grid gap-1.5" aria-label="Precio por volumen">
        {tiers.map((tier) => {
          const reached = group.acceptedApartments >= tier.minApartments;
          const current = reachedPrice === tier.price && reached;
          return (
            <li
              key={tier.minApartments}
              className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm ${
                current
                  ? "border-emerald-500 bg-emerald-50 font-semibold text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-200"
                  : reached
                    ? "border-slate-200 text-slate-500 line-through decoration-slate-300 dark:border-white/10 dark:text-slate-500"
                    : `border-slate-200 dark:border-white/10 ${ui.text}`
              }`}
            >
              <span>
                {tier.minApartments === 0
                  ? "Desde el primer apartamento"
                  : `Desde ${tier.minApartments.toLocaleString("es-CO")} apartamentos`}
              </span>
              <span className="shrink-0">
                {fmtMoney(tier.price, group.currency)}
                <span className="text-xs font-normal">{unit}</span>
                {current ? " ✓" : ""}
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-3">
        <div className="flex justify-between text-xs">
          <span className={ui.text}>
            <strong>{group.acceptedConjuntos}</strong> de {group.invitedConjuntos} conjuntos ·{" "}
            <strong>{group.acceptedApartments.toLocaleString("es-CO")}</strong> de{" "}
            {group.invitedApartments.toLocaleString("es-CO")} apartamentos aprobaron
          </span>
        </div>
        <div className="mt-1.5 h-2 rounded-full bg-slate-200 dark:bg-white/10">
          <div className="h-2 rounded-full bg-cyan-500" style={{ width: `${fill}%` }} />
        </div>
        {open && group.nextTier ? (
          <p className="mt-1.5 text-xs font-medium text-cyan-700 dark:text-cyan-300">
            Con {group.nextTier.missingApartments.toLocaleString("es-CO")} apartamentos más, el
            precio baja a {fmtMoney(group.nextTier.price, group.currency)}
            {unit} para todos.
          </p>
        ) : null}
        {open && group.currentPrice == null ? (
          <p className="mt-1.5 text-xs text-amber-700 dark:text-amber-300">
            Aún no se llega al mínimo. Si al cerrar no se alcanza, no hay
            contrato y nadie queda obligado.
          </p>
        ) : null}
      </div>
    </div>
  );
}
