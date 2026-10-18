"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "complexes-next-components";
import {
  HiOutlineScale,
  HiOutlineUserCircle,
  HiOutlineUsers,
} from "react-icons/hi2";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  ApprovalProposals,
  CouncilTally,
} from "../_components/approval-proposals";
import {
  Callout,
  EmptyState,
  LoadingCards,
  PageHeader,
  Pill,
  Tone,
  fmtDate,
  ui,
} from "../_components/b2b-ui";
import {
  APPROVAL_CHANNEL_LABELS,
  APPROVAL_REASON_MIN,
  APPROVAL_STATUS_LABELS,
  B2bApproval,
  B2bApprovalStatus,
  cancelApproval,
  getMyApprovals,
} from "../services/b2bApprovalService";

const STATUS_TONE: Record<B2bApprovalStatus, Tone> = {
  pending: "info",
  approved: "success",
  rejected: "neutral",
  no_decision: "warning",
  cancelled: "neutral",
};

type Filter = "pending" | "closed";

/** Qué está pasando con una decisión pendiente, dicho para la administración. */
function pendingHint(a: B2bApproval) {
  if (a.channel === "president") {
    return "Esperando la respuesta del presidente. Le llegó un aviso con el cuadro comparativo.";
  }

  const meeting = a.council?.meetingTitle
    ? `«${a.council.meetingTitle}» (${fmtDate(a.council.meetingDate, true)})`
    : "la reunión elegida";

  return a.council?.meetingStatus === "ongoing"
    ? `El consejo la está votando en ${meeting}. El resultado se lee al finalizar la reunión.`
    : `Se votará en ${meeting}. Gana la propuesta con más votos.`;
}

function ApprovalCard({ approval }: { approval: B2bApproval }) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);

  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState("");

  const cancelMut = useMutation({
    mutationFn: () => cancelApproval(conjuntoId, approval.id, reason.trim()),
    onSuccess: () => {
      showAlert("Decisión retirada. Las propuestas vuelven a estar libres.", "success");
      setCancelling(false);
      queryClient.invalidateQueries({ queryKey: ["my_b2b_approvals", conjuntoId] });
      queryClient.invalidateQueries({ queryKey: ["my_b2b_quotes"] });
      queryClient.invalidateQueries({ queryKey: ["my_b2b_contracts"] });
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const missing = APPROVAL_REASON_MIN - reason.trim().length;
  const isCouncil = approval.channel === "council";

  return (
    <article className={`${ui.card} p-4 sm:p-5`}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
            {isCouncil ? <HiOutlineUsers size={20} /> : <HiOutlineUserCircle size={22} />}
          </span>
          <div className="min-w-0">
            <h3 className={`font-semibold ${ui.strong}`}>{approval.title}</h3>
            <p className={`text-xs ${ui.muted}`}>
              Decide: {APPROVAL_CHANNEL_LABELS[approval.channel].toLowerCase()} ·
              enviada el {fmtDate(approval.createdAt, true)}
              {approval.decidedAt && approval.status !== "pending"
                ? ` · cerrada el ${fmtDate(approval.decidedAt, true)}`
                : ""}
            </p>
          </div>
        </div>
        <Pill tone={STATUS_TONE[approval.status]}>
          {APPROVAL_STATUS_LABELS[approval.status]}
        </Pill>
      </header>

      {approval.description ? (
        <p className={`mt-3 whitespace-pre-line text-sm ${ui.text}`}>
          {approval.description}
        </p>
      ) : null}

      <div className="mt-4">
        <ApprovalProposals items={approval.items} />
      </div>

      <div className="mt-4 space-y-3">
        {approval.status === "pending" ? (
          <Callout tone="info">{pendingHint(approval)}</Callout>
        ) : null}

        {approval.council?.tally?.length ? (
          <div className={`${ui.subtle} p-3`}>
            <p className={`mb-2 text-xs font-semibold ${ui.text}`}>
              Resultado de la votación del consejo
            </p>
            <CouncilTally tally={approval.council.tally} />
          </div>
        ) : null}

        {approval.status === "approved" ? (
          <Callout
            tone="success"
            title="Aprobada"
            action={
              <Link href="/my-b2b/contracts" className={`text-sm ${ui.link}`}>
                Ver contrato →
              </Link>
            }
          >
            {approval.decisionNote ? `${approval.decisionNote} ` : ""}
            Falta que el proveedor confirme la alianza.
          </Callout>
        ) : approval.status === "no_decision" ? (
          <Callout
            tone="warning"
            title="Sin decisión"
            action={
              <Link href="/my-b2b/quotes" className={`text-sm ${ui.link}`}>
                Llevarla de nuevo →
              </Link>
            }
          >
            {approval.decisionNote} Las propuestas siguen vigentes.
          </Callout>
        ) : approval.decisionNote ? (
          <Callout tone="neutral">{approval.decisionNote}</Callout>
        ) : null}
      </div>

      {approval.status === "pending" ? (
        <div className={`mt-4 border-t pt-3 ${ui.divider}`}>
          {cancelling ? (
            <div className="space-y-2">
              <label className={ui.label} htmlFor={`cancel-${approval.id}`}>
                ¿Por qué la retiras? Quien iba a decidir lo verá.
              </label>
              <textarea
                id={`cancel-${approval.id}`}
                rows={2}
                className={ui.input}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="xs"
                  rounded="md"
                  colVariant="danger"
                  disabled={missing > 0 || cancelMut.isLoading}
                  onClick={() => cancelMut.mutate()}
                >
                  Retirar decisión
                </Button>
                <Button
                  size="xs"
                  rounded="md"
                  colVariant="default"
                  onClick={() => setCancelling(false)}
                >
                  Volver
                </Button>
                {missing > 0 ? (
                  <span className="text-xs text-amber-700 dark:text-amber-300">
                    Faltan {missing} caracteres
                  </span>
                ) : null}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setCancelling(true)}
              className={`text-sm font-medium ${ui.muted} hover:text-red-600 dark:hover:text-red-400`}
            >
              Retirar decisión
            </button>
          )}
        </div>
      ) : null}
    </article>
  );
}

export default function MyB2bApprovalsPage() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const [filter, setFilter] = useState<Filter>("pending");

  const { data: approvals, isLoading } = useQuery({
    queryKey: ["my_b2b_approvals", conjuntoId],
    queryFn: () => getMyApprovals(conjuntoId),
    enabled: !!conjuntoId,
    // El consejo puede cerrar la reunión mientras la pantalla está abierta.
    refetchInterval: 60_000,
  });

  const pending = (approvals ?? []).filter((a) => a.status === "pending");
  const closed = (approvals ?? []).filter((a) => a.status !== "pending");
  const list = filter === "pending" ? pending : closed;

  return (
    <div className="w-full min-w-0 p-2">
      <PageHeader
        title="Decisiones de contratación"
        description="La administración ejecuta lo que autoriza el conjunto. Aquí ves lo que llevaste al consejo o al presidente y qué decidieron."
      />

      <div className="mt-5 flex flex-wrap gap-2">
        {(
          [
            { key: "pending", label: "En decisión", count: pending.length },
            { key: "closed", label: "Cerradas", count: closed.length },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              filter === tab.key
                ? "border-cyan-600 bg-cyan-600 text-white"
                : "border-slate-200 bg-white text-slate-600 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-slate-100"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 opacity-75">{tab.count}</span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingCards count={2} />
      ) : list.length > 0 ? (
        <div className="mt-4 grid gap-4">
          {list.map((a) => (
            <ApprovalCard key={a.id} approval={a} />
          ))}
        </div>
      ) : filter === "pending" ? (
        <EmptyState
          icon={<HiOutlineScale />}
          title="No hay contrataciones en decisión"
          action={
            <Link href="/my-b2b/quotes" className={`text-sm ${ui.link}`}>
              Ir a Cotizaciones →
            </Link>
          }
        >
          Marca las cotizaciones que quieres comparar en «Cotizaciones», o lleva
          un plan desde la ficha de un aliado.
        </EmptyState>
      ) : (
        <EmptyState icon={<HiOutlineScale />} title="Aún no hay decisiones cerradas">
          Cuando el consejo o el presidente decida, el resultado queda aquí.
        </EmptyState>
      )}
    </div>
  );
}
