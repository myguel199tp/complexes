"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "complexes-next-components";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  B2bContract,
  setB2bContractEndDate,
} from "../services/b2bAllianceService";
import { ApprovalFormModal } from "./approval-form-modal";
import { Callout, fmtDate, fmtMoney, ui } from "./b2b-ui";

const DAY_MS = 86_400_000;

/** Qué tanto del plazo ya corrió, de 0 a 100. */
function elapsedPercent(contract: B2bContract) {
  if (!contract.startDate || !contract.endDate) return null;
  const start = new Date(contract.startDate).getTime();
  const end = new Date(contract.endDate).getTime();
  if (end <= start) return null;
  return Math.min(100, Math.max(0, ((Date.now() - start) / (end - start)) * 100));
}

/**
 * Vigencia de una alianza del conjunto: cuánto le queda, la propuesta de
 * renovación del proveedor y, en los contratos viejos, el registro de la fecha
 * de fin. Renovar no es un clic: se lleva a decisión del consejo o del
 * presidente, si se quiere junto con cotizaciones de otros proveedores.
 */
export function ContractTerm({ contract }: { contract: B2bContract }) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);

  const [endDate, setEndDate] = useState("");
  const [deciding, setDeciding] = useState(false);

  const endMut = useMutation({
    mutationFn: () => setB2bContractEndDate(conjuntoId, contract.id, endDate),
    onSuccess: () => {
      showAlert("Vigencia registrada. Te avisaremos antes de que venza.", "success");
      queryClient.invalidateQueries({ queryKey: ["my_b2b_contracts", conjuntoId] });
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const offer = contract.renewalOffer;
  const days = contract.daysToEnd;
  const percent = elapsedPercent(contract);
  const running = contract.status === "active" || contract.status === "suspended";
  const soon = days != null && days <= 30;
  const minDate = new Date(Date.now() + DAY_MS).toISOString().slice(0, 10);

  return (
    <div className="space-y-3">
      {running && contract.endDate ? (
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
            <span className={ui.muted}>
              Vigencia
              {contract.termMonths ? ` de ${contract.termMonths} meses` : ""} · hasta el{" "}
              <strong className={ui.strong}>{fmtDate(contract.endDate, true)}</strong>
            </span>
            {days != null && days > 0 ? (
              <span
                className={`font-semibold ${
                  soon ? "text-amber-700 dark:text-amber-300" : ui.muted
                }`}
              >
                Faltan {days} día{days === 1 ? "" : "s"}
              </span>
            ) : null}
          </div>
          {percent != null ? (
            <div className="mt-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-white/10">
              <div
                className={`h-1.5 rounded-full ${soon ? "bg-amber-500" : "bg-cyan-500"}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {contract.status === "expired" ? (
        <Callout tone="neutral">
          Terminó su vigencia el {fmtDate(contract.endDate, true)} sin renovarse.
        </Callout>
      ) : null}

      {contract.nextAmount != null && contract.nextAmountFrom ? (
        <Callout tone="success" title="Renovado">
          Desde el {fmtDate(contract.nextAmountFrom, true)} se cobra{" "}
          {fmtMoney(contract.nextAmount, contract.currency)} por periodo.
        </Callout>
      ) : null}

      {contract.needsEndDate ? (
        <Callout tone="warning" title="Registra cuándo vence">
          Este contrato es anterior a la vigencia. Pon la fecha de fin que
          firmaron para avisarte antes y poder decidir si se renueva.
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              type="date"
              min={minDate}
              aria-label="Fecha de fin del contrato"
              className={`${ui.input} !w-auto`}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <Button
              size="xs"
              rounded="md"
              colVariant="primary"
              disabled={!endDate || endMut.isLoading}
              onClick={() => endMut.mutate()}
            >
              Registrar
            </Button>
          </div>
        </Callout>
      ) : null}

      {offer ? (
        <Callout
          tone="accent"
          title={`El proveedor propone renovar por ${offer.termMonths} meses`}
          action={
            offer.inDecision ? (
              <Link href="/my-b2b/approvals" className={`text-sm ${ui.link}`}>
                Ver decisión →
              </Link>
            ) : (
              <Button size="xs" rounded="md" colVariant="success" onClick={() => setDeciding(true)}>
                Llevar a decisión
              </Button>
            )
          }
        >
          <strong>{fmtMoney(offer.amount, contract.currency)}</strong> por periodo ·{" "}
          {offer.changePercent > 0 ? "+" : ""}
          {offer.changePercent}% frente a {fmtMoney(offer.previousAmount, contract.currency)}.
          {offer.note ? <span className="block italic">“{offer.note}”</span> : null}
          {offer.inDecision ? (
            <span className="block">Ya está en decisión del conjunto.</span>
          ) : (
            <span className="block">
              ¿Quieres comparar? Pide cotizaciones a otros y llévalas junto con
              esta desde{" "}
              <Link href="/my-b2b/quotes" className={ui.link}>
                Cotizaciones
              </Link>
              .
            </span>
          )}
        </Callout>
      ) : contract.renewalWindowOpen ? (
        <p className={`text-xs ${ui.muted}`}>
          El proveedor aún no propone la renovación. Si no lo hace, el contrato
          termina en su fecha.
        </p>
      ) : null}

      {offer ? (
        <ApprovalFormModal
          isOpen={deciding}
          onClose={() => setDeciding(false)}
          renewalIds={[offer.id]}
          defaultTitle={`Renovación: ${contract.planName}`}
          proposals={[
            {
              key: offer.id,
              label: `Renovar con ${contract.comercio?.businessName ?? "el proveedor actual"} — ${fmtMoney(offer.amount, contract.currency)} (${offer.changePercent > 0 ? "+" : ""}${offer.changePercent}%)`,
            },
          ]}
        />
      ) : null}
    </div>
  );
}
