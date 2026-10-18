"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "complexes-next-components";
import {
  HiOutlineScale,
  HiOutlineUserCircle,
  HiOutlineUsers,
} from "react-icons/hi2";
import {
  ApprovalProposals,
  CouncilTally,
} from "@/app/(panel)/my-b2b/_components/approval-proposals";
import {
  Callout,
  EmptyState,
  LoadingCards,
  Pill,
  SectionTitle,
  Tone,
  fmtDate,
  ui,
} from "@/app/(panel)/my-b2b/_components/b2b-ui";
import {
  APPROVAL_REASON_MIN,
  APPROVAL_STATUS_LABELS,
  B2bApproval,
  B2bApprovalStatus,
} from "@/app/(panel)/my-b2b/services/b2bApprovalService";
import {
  useB2bApprovalsToDecide,
  useDecideB2bApproval,
  useMyB2bApprovalStatus,
} from "./use-b2b-approvals";

const STATUS_TONE: Record<B2bApprovalStatus, Tone> = {
  pending: "info",
  approved: "success",
  rejected: "neutral",
  no_decision: "warning",
  cancelled: "neutral",
};

function ApprovalToDecide({ approval }: { approval: B2bApproval }) {
  const decide = useDecideB2bApproval();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  // Elegir compromete la plata del conjunto: pasa por una confirmación.
  const [confirming, setConfirming] = useState<string | null>(null);

  const isPending = approval.status === "pending";
  const byPresident = approval.channel === "president";
  const missing = APPROVAL_REASON_MIN - reason.trim().length;
  const chosenItem = approval.items.find((i) => i.id === confirming);

  return (
    <article className={`${ui.card} p-4 sm:p-5`}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300">
            {byPresident ? <HiOutlineUserCircle size={22} /> : <HiOutlineUsers size={20} />}
          </span>
          <div className="min-w-0">
            <h3 className={`font-semibold ${ui.strong}`}>{approval.title}</h3>
            <p className={`text-xs ${ui.muted}`}>
              Enviada por la administración el {fmtDate(approval.createdAt, true)}
            </p>
          </div>
        </div>
        <Pill tone={STATUS_TONE[approval.status]}>
          {isPending && byPresident ? "Espera tu decisión" : APPROVAL_STATUS_LABELS[approval.status]}
        </Pill>
      </header>

      {approval.description ? (
        <div className={`mt-3 ${ui.subtle} p-3`}>
          <p className={`text-xs font-semibold ${ui.muted}`}>Lo que dice la administración</p>
          <p className={`mt-1 whitespace-pre-line text-sm ${ui.text}`}>{approval.description}</p>
        </div>
      ) : null}

      <div className="mt-4">
        <ApprovalProposals
          items={approval.items}
          action={
            isPending && byPresident
              ? (item) => (
                  <Button
                    size="sm"
                    rounded="md"
                    colVariant="success"
                    className="w-full"
                    disabled={decide.isLoading}
                    onClick={() => setConfirming(item.id)}
                  >
                    Elegir esta
                  </Button>
                )
              : undefined
          }
        />
      </div>

      <div className="mt-4 space-y-3">
        {chosenItem ? (
          <Callout
            tone="success"
            title={`¿Elegir a ${chosenItem.comercioName ?? "este proveedor"}?`}
            action={
              <div className="flex gap-2">
                <Button size="xs" rounded="md" colVariant="default" onClick={() => setConfirming(null)}>
                  Volver
                </Button>
                <Button
                  size="xs"
                  rounded="md"
                  colVariant="success"
                  disabled={decide.isLoading}
                  onClick={() =>
                    decide.mutate(
                      { id: approval.id, decision: "approve", itemId: chosenItem.id },
                      { onSettled: () => setConfirming(null) },
                    )
                  }
                >
                  Sí, elegir
                </Button>
              </div>
            }
          >
            La administración y el proveedor serán avisados. El proveedor debe
            confirmar la alianza para que arranque el servicio.
          </Callout>
        ) : null}

        {isPending && !byPresident ? (
          <Callout
            tone="info"
            title="Se vota en la reunión del consejo"
            action={
              <Link href="/my-council" className={`text-sm ${ui.link}`}>
                Ir al consejo →
              </Link>
            }
          >
            {approval.council?.meetingTitle
              ? `«${approval.council.meetingTitle}» · ${fmtDate(approval.council.meetingDate, true)}. `
              : ""}
            Gana la propuesta con más votos; con empate no hay decisión.
          </Callout>
        ) : null}

        {approval.council?.tally?.length ? (
          <div className={`${ui.subtle} p-3`}>
            <p className={`mb-2 text-xs font-semibold ${ui.text}`}>Votación del consejo</p>
            <CouncilTally tally={approval.council.tally} />
          </div>
        ) : null}

        {approval.decisionNote ? (
          <Callout tone={STATUS_TONE[approval.status]}>{approval.decisionNote}</Callout>
        ) : null}
      </div>

      {isPending && byPresident && !chosenItem ? (
        <div className={`mt-4 border-t pt-3 ${ui.divider}`}>
          {rejecting ? (
            <div className="space-y-2">
              <label className={ui.label} htmlFor={`reject-${approval.id}`}>
                ¿Por qué no tomas ninguna? La administración lo verá.
              </label>
              <textarea
                id={`reject-${approval.id}`}
                rows={3}
                className={ui.input}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="xs"
                  rounded="md"
                  colVariant="danger"
                  disabled={missing > 0 || decide.isLoading}
                  onClick={() =>
                    decide.mutate({ id: approval.id, decision: "reject", reason: reason.trim() })
                  }
                >
                  No tomar ninguna
                </Button>
                <Button size="xs" rounded="md" colVariant="default" onClick={() => setRejecting(false)}>
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
              onClick={() => setRejecting(true)}
              className={`text-sm font-medium ${ui.muted} hover:text-red-600 dark:hover:text-red-400`}
            >
              Ninguna me convence
            </button>
          )}
        </div>
      ) : null}
    </article>
  );
}

/**
 * Bandeja de contrataciones. El presidente designado (Básico y Oro) elige aquí
 * la propuesta; los miembros del consejo (Platino) ven el cuadro comparativo
 * antes de votar en su reunión.
 */
export default function B2bApprovalsPage() {
  const { data: me, isLoading: loadingMe } = useMyB2bApprovalStatus();
  const allowed = !!me && (me.isApprover || me.isCouncilMember);
  const { data = [], isLoading, error } = useB2bApprovalsToDecide(allowed);

  if (!loadingMe && !allowed) {
    return (
      <div className="w-full min-w-0 p-2">
        <EmptyState icon={<HiOutlineScale />} title="No decides contrataciones en este conjunto">
          Esta sección es para el consejo de administración o el propietario
          que la administración designó como aprobador.
        </EmptyState>
      </div>
    );
  }

  const pending = data.filter((a) => a.status === "pending");
  const decided = data.filter((a) => a.status !== "pending");

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl p-2">
      <header>
        <h1 className={`text-xl font-bold sm:text-2xl ${ui.title}`}>Contrataciones por decidir</h1>
        <p className={`mt-1 max-w-3xl text-sm ${ui.muted}`}>
          {me?.isCouncilMember
            ? "La administración trae aquí las propuestas que reunió. El consejo las vota en su reunión; si se elige una, el proveedor debe confirmar la alianza."
            : "La administración necesita tu visto bueno para contratar. Compara las propuestas y elige una, o di que ninguna con tu motivo."}
        </p>
      </header>

      {error ? (
        <div className="mt-6">
          <Callout tone="danger">{(error as Error).message}</Callout>
        </div>
      ) : isLoading || loadingMe ? (
        <LoadingCards count={2} />
      ) : (
        <>
          <section className="mt-6">
            <SectionTitle
              title="Pendientes"
              right={pending.length ? <Pill tone="info">{pending.length}</Pill> : undefined}
            />
            {pending.length === 0 ? (
              <EmptyState icon={<HiOutlineScale />} title="Nada por decidir">
                Te avisaremos cuando la administración traiga una contratación.
              </EmptyState>
            ) : (
              <div className="mt-3 grid gap-4">
                {pending.map((a) => (
                  <ApprovalToDecide key={a.id} approval={a} />
                ))}
              </div>
            )}
          </section>

          {decided.length > 0 ? (
            <details className="mt-8">
              <summary className={`cursor-pointer text-sm font-semibold ${ui.muted}`}>
                Ya decididas ({decided.length})
              </summary>
              <div className="mt-3 grid gap-4">
                {decided.map((a) => (
                  <ApprovalToDecide key={a.id} approval={a} />
                ))}
              </div>
            </details>
          ) : null}
        </>
      )}
    </div>
  );
}
