"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Modal } from "complexes-next-components";
import { HiOutlineDocumentCheck } from "react-icons/hi2";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  B2bCancellationReason,
  B2bContract,
  B2bContractStatus,
  B2B_CANCELLATION_REASONS,
  CANCEL_REASON_MIN_ACTIVE,
  CANCEL_REASON_MIN_PENDING,
  cancelB2bContract,
  getMyB2bContracts,
  rateB2bComercio,
} from "../services/b2bAllianceService";
import { StarInput, StarRating } from "../_components/star-rating";
import { ContractTerm } from "../_components/contract-term";
import { GroupProgress } from "../_components/group-progress";
import {
  Callout,
  EmptyState,
  Fact,
  LoadingCards,
  PageHeader,
  PERIOD_SHORT,
  Pill,
  Stat,
  Tone,
  fmtDate,
  fmtMoney,
  modal,
  ui,
} from "../_components/b2b-ui";

const STATUS_LABELS: Record<B2bContractStatus, string> = {
  pending: "Esperando al proveedor",
  active: "Activo",
  rejected: "Rechazado",
  cancelled: "Cancelado",
  suspended: "Suspendido por mora",
  expired: "Terminado",
};

const STATUS_TONE: Record<B2bContractStatus, Tone> = {
  pending: "warning",
  active: "success",
  rejected: "danger",
  cancelled: "neutral",
  suspended: "danger",
  expired: "neutral",
};

const CATEGORY_LABELS: Record<B2bCancellationReason, string> =
  B2B_CANCELLATION_REASONS.reduce(
    (acc, r) => ({ ...acc, [r.value]: r.label }),
    {} as Record<B2bCancellationReason, string>,
  );

type Filter = "current" | "pending" | "ended";

const FILTERS: { key: Filter; label: string; statuses: B2bContractStatus[] }[] = [
  { key: "current", label: "Vigentes", statuses: ["active", "suspended"] },
  { key: "pending", label: "Por confirmar", statuses: ["pending"] },
  { key: "ended", label: "Terminados", statuses: ["expired", "cancelled", "rejected"] },
];

function ContractCard({
  contract: c,
  onCancel,
  onRate,
}: {
  contract: B2bContract;
  onCancel: (c: B2bContract) => void;
  onRate: (c: B2bContract) => void;
}) {
  const period = PERIOD_SHORT[c.billingPeriod] ?? c.billingPeriod;
  const owes = c.outstanding && c.outstanding.amount > 0 ? c.outstanding : null;

  return (
    <article className={`${ui.card} flex flex-col p-4 sm:p-5`}>
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className={`font-semibold ${ui.strong}`}>{c.planName}</h3>
          <p className={`text-sm ${ui.muted}`}>{c.comercio?.businessName ?? "Proveedor"}</p>
        </div>
        <Pill tone={STATUS_TONE[c.status]}>{STATUS_LABELS[c.status]}</Pill>
      </header>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Fact label="Valor">
          {fmtMoney(c.amount, c.currency)}
          <span className={`text-xs font-normal ${ui.muted}`}> / {period}</span>
        </Fact>
        {c.pricingModel === "por_apartamento" && c.quantityapt ? (
          <Fact label="Cálculo">{c.quantityapt} apartamentos</Fact>
        ) : null}
        {c.nextPaymentDate && c.status === "active" ? (
          <Fact label="Próximo cobro">{fmtDate(c.nextPaymentDate, true)}</Fact>
        ) : null}
      </div>

      <div className="mt-4">
        <ContractTerm contract={c} />
      </div>

      <div className="mt-3 space-y-2">
        {owes ? (
          <Callout
            tone={owes.overdueAmount > 0 ? "danger" : "warning"}
            title={`Pendiente por pagar: ${fmtMoney(owes.amount, c.currency)}`}
            action={
              <Link href="/my-b2b/invoices" className={`text-sm ${ui.link}`}>
                Ver facturas →
              </Link>
            }
          >
            {owes.count} factura{owes.count === 1 ? "" : "s"}
            {owes.overdueAmount > 0
              ? ` · ${fmtMoney(owes.overdueAmount, c.currency)} vencidos hace ${owes.daysOverdue} día${owes.daysOverdue === 1 ? "" : "s"}. El proveedor puede suspender el servicio.`
              : " dentro del plazo."}
          </Callout>
        ) : null}

        {c.status === "pending" && c.group?.status === "open" ? (
          <div className="space-y-2">
            <Callout tone="accent" title="Esperando al grupo">
              Tu conjunto ya lo aprobó. El precio final se conoce cuando cierre
              la ventana de la compra en grupo; nunca será mayor al aprobado.
            </Callout>
            <GroupProgress group={c.group} compact />
          </div>
        ) : c.status === "pending" ? (
          <Callout tone="warning">
            El conjunto ya lo aprobó. Falta que el proveedor confirme la alianza
            para que arranque el servicio.
          </Callout>
        ) : null}

        {c.status === "suspended" ? (
          <Callout tone="danger" title="Servicio suspendido">
            {c.suspensionReason ?? "Por facturas vencidas."} Se reactiva solo al
            ponerte al día.
          </Callout>
        ) : null}

        {c.rejectionReason ? (
          <Callout tone="danger" title="El proveedor lo rechazó">
            {c.rejectionReason}
          </Callout>
        ) : null}

        {c.cancellationReason ? (
          <Callout tone="neutral" title="Cancelado">
            {c.cancellationCategory ? `${CATEGORY_LABELS[c.cancellationCategory]}: ` : ""}
            {c.cancellationReason}
          </Callout>
        ) : null}
      </div>

      {c.myRating ? (
        <div className="mt-3">
          <StarRating value={c.myRating.rating} showValue={false} />
          {c.myRating.comment ? (
            <p className={`mt-1 text-xs italic ${ui.muted}`}>“{c.myRating.comment}”</p>
          ) : null}
        </div>
      ) : null}

      {c.status === "pending" || c.status === "active" || c.canRate ? (
        <footer className={`mt-4 flex flex-wrap items-center gap-2 border-t pt-3 ${ui.divider}`}>
          {c.canRate ? (
            <Button colVariant="primary" size="xs" rounded="md" onClick={() => onRate(c)}>
              Calificar proveedor
            </Button>
          ) : null}
          {c.status === "pending" || c.status === "active" ? (
            <button
              type="button"
              onClick={() => onCancel(c)}
              className={`ml-auto text-xs font-medium ${ui.muted} hover:text-red-600 dark:hover:text-red-400`}
            >
              {c.status === "active" ? "Cancelar alianza" : "Retirar solicitud"}
            </button>
          ) : null}
        </footer>
      ) : null}
    </article>
  );
}

export default function MyB2bContractsPage() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);

  // Sin elección explícita, abre en la primera pestaña que tenga algo.
  const [chosenFilter, setFilter] = useState<Filter | null>(null);

  const [cancelTarget, setCancelTarget] = useState<B2bContract | null>(null);
  const [reason, setReason] = useState("");
  const [category, setCategory] = useState<string>("");

  const [rateTarget, setRateTarget] = useState<B2bContract | null>(null);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");

  const { data: contracts, isLoading } = useQuery({
    queryKey: ["my_b2b_contracts", conjuntoId],
    queryFn: () => getMyB2bContracts(conjuntoId),
    enabled: !!conjuntoId,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["my_b2b_contracts", conjuntoId] });

  const closeCancel = () => {
    setCancelTarget(null);
    setReason("");
    setCategory("");
  };

  const closeRate = () => {
    setRateTarget(null);
    setStars(0);
    setComment("");
  };

  const cancelMut = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { reason: string; category?: B2bCancellationReason };
    }) => cancelB2bContract(conjuntoId, id, data),
    onSuccess: (_result, variables) => {
      showAlert("Alianza cancelada", "success");
      const cancelled = cancelTarget;
      closeCancel();
      invalidate();

      // Si la alianza llegó a estar activa, se ofrece calificar en el momento:
      // es cuando el administrador tiene la experiencia más fresca.
      if (cancelled && cancelled.status === "active" && !cancelled.myRating) {
        setRateTarget({ ...cancelled, id: variables.id });
      }
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const rateMut = useMutation({
    mutationFn: ({
      contractId,
      data,
    }: {
      contractId: string;
      data: { rating: number; comment?: string };
    }) => rateB2bComercio(conjuntoId, contractId, data),
    onSuccess: () => {
      showAlert("¡Gracias por calificar!", "success");
      closeRate();
      invalidate();
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const all = useMemo(() => contracts ?? [], [contracts]);

  const summary = useMemo(() => {
    const current = all.filter((c) => c.status === "active" || c.status === "suspended");
    return {
      current: current.length,
      endingSoon: current.filter((c) => c.daysToEnd != null && c.daysToEnd <= 60).length,
      debt: all.reduce((sum, c) => sum + (c.outstanding?.amount ?? 0), 0),
      overdue: all.reduce((sum, c) => sum + (c.outstanding?.overdueAmount ?? 0), 0),
      currency: all[0]?.currency ?? "COP",
    };
  }, [all]);

  const byFilter = (f: Filter) =>
    all.filter((c) => FILTERS.find((x) => x.key === f)!.statuses.includes(c.status));
  const filter: Filter =
    chosenFilter ??
    FILTERS.find((f) => byFilter(f.key).length > 0)?.key ??
    "current";
  const list = byFilter(filter);

  const isActiveCancel = cancelTarget?.status === "active";
  const minLength = isActiveCancel ? CANCEL_REASON_MIN_ACTIVE : CANCEL_REASON_MIN_PENDING;
  const remaining = minLength - reason.trim().length;
  const canSubmitCancel = remaining <= 0 && (!isActiveCancel || category !== "");

  return (
    <div className="w-full min-w-0 p-2">
      <PageHeader
        title="Contratos"
        description="Tus alianzas con proveedores: su vigencia, lo que se debe y las renovaciones que proponen."
      />

      {isLoading ? (
        <LoadingCards />
      ) : all.length === 0 ? (
        <EmptyState
          icon={<HiOutlineDocumentCheck />}
          title="Aún no tienes contratos"
          action={
            <Link href="/my-b2b" className={`text-sm ${ui.link}`}>
              Buscar aliados →
            </Link>
          }
        >
          Un contrato nace cuando el consejo o el presidente elige una
          propuesta y el proveedor confirma la alianza.
        </EmptyState>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Stat label="Contratos vigentes" value={summary.current} />
            <Stat
              label="Vencen en 60 días o menos"
              value={summary.endingSoon}
              tone={summary.endingSoon > 0 ? "warning" : "neutral"}
              hint={summary.endingSoon > 0 ? "Decide a tiempo si se renuevan" : undefined}
            />
            <Stat
              label="Pendiente por pagar"
              value={fmtMoney(summary.debt, summary.currency)}
              tone={summary.overdue > 0 ? "danger" : "neutral"}
              hint={
                summary.overdue > 0
                  ? `${fmtMoney(summary.overdue, summary.currency)} vencidos`
                  : undefined
              }
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const count = byFilter(f.key).length;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                    filter === f.key
                      ? "border-cyan-600 bg-cyan-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-slate-100"
                  }`}
                >
                  {f.label}
                  <span className="ml-1.5 opacity-75">{count}</span>
                </button>
              );
            })}
          </div>

          {list.length ? (
            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              {list.map((c) => (
                <ContractCard
                  key={c.id}
                  contract={c}
                  onCancel={setCancelTarget}
                  onRate={setRateTarget}
                />
              ))}
            </div>
          ) : (
            <p className={`mt-6 text-sm ${ui.muted}`}>No hay contratos en esta pestaña.</p>
          )}
        </>
      )}

      {/* ─────────── Cancelar alianza ─────────── */}
      <Modal
        className="w-11/12 max-w-md max-h-[88vh] overflow-y-auto"
        isOpen={!!cancelTarget}
        onClose={closeCancel}
        title={isActiveCancel ? "Cancelar alianza activa" : "Retirar solicitud"}
      >
        <div className="space-y-4">
          {isActiveCancel ? (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              La alianza con <strong>{cancelTarget?.comercio?.businessName}</strong>{" "}
              está vigente. Indica la causal y explica el motivo: quedará
              registrado y el proveedor lo verá.
            </div>
          ) : (
            <p className={modal.text}>
              Cuéntanos por qué retiras la solicitud de{" "}
              <strong className={modal.strong}>{cancelTarget?.planName}</strong>.
            </p>
          )}

          {isActiveCancel ? (
            <div>
              <label className={modal.label} htmlFor="cancel-category">
                Causal
              </label>
              <select
                id="cancel-category"
                className={modal.input}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Selecciona una causal</option>
                {B2B_CANCELLATION_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div>
            <label className={modal.label} htmlFor="cancel-reason">
              Motivo
            </label>
            <textarea
              id="cancel-reason"
              rows={4}
              className={modal.input}
              placeholder={
                isActiveCancel
                  ? "Explica con detalle el motivo de la cancelación"
                  : "Motivo"
              }
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <p
              className={`mt-1 text-xs ${
                remaining > 0 ? "text-amber-700" : "text-emerald-700"
              }`}
            >
              {remaining > 0
                ? `Faltan ${remaining} caracteres (mínimo ${minLength})`
                : "Motivo suficiente"}
            </p>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <Button size="sm" rounded="md" colVariant="default" onClick={closeCancel}>
              Volver
            </Button>
            <Button
              colVariant="danger"
              size="sm"
              rounded="md"
              disabled={!canSubmitCancel || cancelMut.isLoading}
              onClick={() =>
                cancelTarget &&
                cancelMut.mutate({
                  id: cancelTarget.id,
                  data: {
                    reason: reason.trim(),
                    category: isActiveCancel ? (category as B2bCancellationReason) : undefined,
                  },
                })
              }
            >
              {cancelMut.isLoading ? "Cancelando…" : "Confirmar"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─────────── Calificar comercio ─────────── */}
      <Modal
        className="w-11/12 max-w-md max-h-[88vh] overflow-y-auto"
        isOpen={!!rateTarget}
        onClose={closeRate}
        title={`Calificar a ${rateTarget?.comercio?.businessName ?? "el proveedor"}`}
      >
        <div className="space-y-4">
          <p className={modal.text}>
            Tu calificación construye la reputación de esta empresa ante otros
            conjuntos. Solo puedes calificarla una vez por alianza.
          </p>

          <div className="flex justify-center rounded-xl bg-slate-50 py-4">
            <StarInput value={stars} onChange={setStars} disabled={rateMut.isLoading} />
          </div>

          <div>
            <label className={modal.label} htmlFor="rate-comment">
              Comentario <span className="font-normal text-slate-400">(opcional)</span>
            </label>
            <textarea
              id="rate-comment"
              rows={3}
              className={modal.input}
              placeholder="¿Cumplió? ¿Cómo fue el servicio?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <Button size="sm" rounded="md" colVariant="default" onClick={closeRate}>
              Ahora no
            </Button>
            <Button
              colVariant="primary"
              size="sm"
              rounded="md"
              disabled={stars < 1 || rateMut.isLoading}
              onClick={() =>
                rateTarget &&
                rateMut.mutate({
                  contractId: rateTarget.id,
                  data: { rating: stars, comment: comment.trim() || undefined },
                })
              }
            >
              {rateMut.isLoading ? "Enviando…" : "Enviar calificación"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
