"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Modal } from "complexes-next-components";
import { HiOutlineBuildingOffice2, HiOutlineHome } from "react-icons/hi2";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { DemandFormModal } from "../_components/demand-form-modal";
import {
  DEMAND_CANCEL_REASON_MIN,
  DEMAND_STATUS_LABELS,
  DEMAND_STATUS_TONE,
  UpdateB2bDemandPayload,
  cancelB2bDemand,
  demandCategoryLabel,
  getB2bDemand,
  joinB2bDemand,
  leaveB2bDemand,
  updateB2bDemand,
} from "../../services/b2bDemandService";
import {
  Callout,
  EmptyState,
  Fact,
  LoadingCards,
  PageHeader,
  Pill,
  fmtDate,
  fmtMoney,
  modal,
  ui,
} from "../../_components/b2b-ui";
import { GroupProgress } from "../../_components/group-progress";

/**
 * Detalle de una convocatoria: qué se necesita y, sobre todo, quiénes están
 * dentro. Se muestran nombre, ciudad y apartamentos de cada conjunto —no sus
 * datos de contacto—: para decidir si sumarse basta saber cuánto volumen hay,
 * y el contacto lo hace el equipo del club.
 */
export default function B2bDemandDetailPage() {
  const params = useParams<{ demandId: string }>();
  const demandId = params?.demandId ?? "";
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);

  const [joinNote, setJoinNote] = useState("");
  const [joinCost, setJoinCost] = useState("");
  const [isJoinOpen, setJoinOpen] = useState(false);
  const [isEditOpen, setEditOpen] = useState(false);
  const [isCancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const { data: demand, isLoading } = useQuery({
    queryKey: ["b2b_demand_detail", conjuntoId, demandId],
    queryFn: () => getB2bDemand(conjuntoId, demandId),
    enabled: !!conjuntoId && !!demandId,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["b2b_demand_detail"] });
    queryClient.invalidateQueries({ queryKey: ["b2b_demands_feed"] });
    queryClient.invalidateQueries({ queryKey: ["b2b_demands_mine"] });
  };

  const onError = (error: Error) => showAlert(error.message, "error");

  const joinMutation = useMutation({
    mutationFn: () =>
      joinB2bDemand(conjuntoId, demandId, {
        note: joinNote,
        currentMonthlyCost: joinCost ? Number(joinCost) : undefined,
      }),
    onSuccess: () => {
      setJoinOpen(false);
      setJoinNote("");
      setJoinCost("");
      invalidate();
      showAlert("Tu conjunto quedó sumado a la convocatoria", "success");
    },
    onError,
  });

  const leaveMutation = useMutation({
    mutationFn: () => leaveB2bDemand(conjuntoId, demandId),
    onSuccess: () => {
      invalidate();
      showAlert("Tu conjunto salió de la convocatoria", "success");
    },
    onError,
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateB2bDemandPayload) =>
      updateB2bDemand(conjuntoId, demandId, payload),
    onSuccess: () => {
      setEditOpen(false);
      invalidate();
      showAlert("Necesidad actualizada", "success");
    },
    onError,
  });

  const cancelMutation = useMutation({
    mutationFn: () => cancelB2bDemand(conjuntoId, demandId, { reason: cancelReason }),
    onSuccess: () => {
      setCancelOpen(false);
      setCancelReason("");
      invalidate();
      showAlert("Convocatoria retirada", "success");
    },
    onError,
  });

  if (isLoading) {
    return (
      <div className="w-full min-w-0 p-2">
        <LoadingCards count={2} />
      </div>
    );
  }

  if (!demand) {
    return (
      <div className="w-full min-w-0 p-2">
        <EmptyState
          title="Convocatoria no encontrada"
          action={
            <Link href="/my-b2b/demands" className={`text-sm ${ui.link}`}>
              ← Volver a Compra en grupo
            </Link>
          }
        />
      </div>
    );
  }

  const isEditable = demand.status === "open" || demand.status === "grouping";
  const missingReason = Math.max(0, DEMAND_CANCEL_REASON_MIN - cancelReason.trim().length);

  return (
    <div className="w-full min-w-0 p-2">
      <PageHeader
        back={{ href: "/my-b2b/demands", label: "Compra en grupo" }}
        title={demand.title}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            <span className="font-semibold text-cyan-700 dark:text-cyan-300">
              {demandCategoryLabel(demand)}
            </span>
            · {demand.city} ·{" "}
            {demand.isOwner ? "Publicada por tu conjunto" : (demand.conjuntoName ?? "Otro conjunto")}
            <Pill tone={DEMAND_STATUS_TONE[demand.status]}>
              {DEMAND_STATUS_LABELS[demand.status]}
            </Pill>
          </span>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className={`${ui.card} p-5 lg:col-span-2`}>
          <p className={`whitespace-pre-line text-sm ${ui.text}`}>{demand.description}</p>

          <div className="mt-5 grid grid-cols-2 gap-4">
            {demand.desiredStartDate ? (
              <Fact label="Inicio deseado">{fmtDate(demand.desiredStartDate, true)}</Fact>
            ) : null}
            <Fact label="Publicada">{fmtDate(demand.createdAt, true)}</Fact>
            {demand.joinDeadline ? (
              <Fact label="Cierre de adhesiones">
                {fmtDate(demand.joinDeadline, true)}
                {demand.joinsOpen && demand.daysToClose != null ? (
                  <span className={`text-xs font-normal ${ui.muted}`}>
                    {" "}
                    · {demand.daysToClose === 0 ? "hoy" : `faltan ${demand.daysToClose} días`}
                  </span>
                ) : null}
              </Fact>
            ) : null}
            {demand.myCurrentMonthlyCost != null ? (
              <Fact label="Tu conjunto paga hoy">
                {fmtMoney(demand.myCurrentMonthlyCost)}
                <span className={`text-xs font-normal ${ui.muted}`}> / mes</span>
              </Fact>
            ) : null}
          </div>

          {demand.group ? (
            <div className="mt-5 space-y-3">
              <GroupProgress group={demand.group} />
              {demand.savings ? (
                <Callout
                  tone="success"
                  title={`Ahorro estimado del grupo: ${fmtMoney(demand.savings.monthlySaving)} al mes (${demand.savings.percent}%)`}
                >
                  Con el precio de hoy, contra lo que dicen pagar{" "}
                  {demand.savings.basedOnConjuntos} conjunto
                  {demand.savings.basedOnConjuntos === 1 ? "" : "s"}.
                  {demand.savings.mine
                    ? ` Tu conjunto pasaría de ${fmtMoney(demand.savings.mine.monthlyBefore)} a ${fmtMoney(demand.savings.mine.monthlyAfter)} al mes.`
                    : ""}
                </Callout>
              ) : null}
              {demand.group.status === "open" && (demand.isOwner || demand.hasJoined) ? (
                <Callout
                  tone="info"
                  title="Tu conjunto ya tiene su cotización"
                  action={
                    <Link href="/my-b2b/quotes" className={`text-sm ${ui.link}`}>
                      Llevarla a decisión →
                    </Link>
                  }
                >
                  Llévala a tu consejo o a tu presidente antes del{" "}
                  {fmtDate(demand.group.decisionDeadline, true)}. Se aprueba el
                  precio techo: el final solo puede ser igual o menor.
                </Callout>
              ) : null}
            </div>
          ) : !demand.joinsOpen && demand.joinDeadline && demand.status !== "closed" && demand.status !== "cancelled" ? (
            <div className="mt-5">
              <Callout tone="info" title="Adhesiones cerradas">
                El volumen quedó fijo y el club está negociando con
                proveedores. Te avisaremos cuando haya oferta grupal.
              </Callout>
            </div>
          ) : null}

          <div className="mt-4 space-y-2">
            {demand.outcomeNote ? (
              <Callout tone="success" title="Nota del club">
                {demand.outcomeNote}
              </Callout>
            ) : null}
            {demand.cancellationReason ? (
              <Callout tone="neutral" title="Retirada">
                {demand.cancellationReason}
              </Callout>
            ) : null}
            {!demand.canJoin.allowed && !demand.hasJoined && !demand.isOwner && demand.canJoin.reason ? (
              <Callout tone="neutral">{demand.canJoin.reason}</Callout>
            ) : null}
          </div>

          <div className={`mt-5 flex flex-wrap gap-2 border-t pt-4 ${ui.divider}`}>
            {demand.canJoin.allowed ? (
              <Button colVariant="primary" size="sm" rounded="md" onClick={() => setJoinOpen(true)}>
                Sumar mi conjunto
              </Button>
            ) : null}
            {demand.hasJoined && demand.joinsOpen ? (
              <Button
                colVariant="danger"
                size="sm"
                rounded="md"
                disabled={leaveMutation.isLoading}
                onClick={() => leaveMutation.mutate()}
              >
                Salir de la convocatoria
              </Button>
            ) : null}
            {demand.isOwner && isEditable ? (
              <>
                <Button colVariant="default" size="sm" rounded="md" onClick={() => setEditOpen(true)}>
                  Editar
                </Button>
                <Button colVariant="danger" size="sm" rounded="md" onClick={() => setCancelOpen(true)}>
                  Retirar
                </Button>
              </>
            ) : null}
          </div>
        </section>

        <aside className={`${ui.card} p-5`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${ui.faint}`}>
            Volumen para negociar
          </p>
          <div className="mt-2 flex gap-6">
            <div>
              <p className={`flex items-center gap-1.5 text-2xl font-bold ${ui.strong}`}>
                <HiOutlineBuildingOffice2 className="text-cyan-600 dark:text-cyan-300" size={22} />
                {demand.totalConjuntos}
              </p>
              <p className={`text-xs ${ui.muted}`}>
                {demand.totalConjuntos === 1 ? "conjunto" : "conjuntos"}
              </p>
            </div>
            {demand.totalApartamentos > 0 ? (
              <div>
                <p className={`flex items-center gap-1.5 text-2xl font-bold ${ui.strong}`}>
                  <HiOutlineHome className="text-cyan-600 dark:text-cyan-300" size={22} />
                  {demand.totalApartamentos}
                </p>
                <p className={`text-xs ${ui.muted}`}>apartamentos</p>
              </div>
            ) : null}
          </div>

          <ul className="mt-4 space-y-2">
            {demand.participants.map((participant) => (
              <li key={participant.conjuntoId} className={`${ui.subtle} p-3`}>
                <p className={`flex items-center justify-between gap-2 text-sm font-medium ${ui.strong}`}>
                  {participant.conjuntoName}
                  {participant.isOwner ? <Pill tone="accent">Publica</Pill> : null}
                </p>
                <p className={`text-xs ${ui.faint}`}>
                  {participant.city}
                  {participant.quantityapt ? ` · ${participant.quantityapt} apt` : ""}
                </p>
                {participant.note ? (
                  <p className={`mt-1 text-xs ${ui.muted}`}>{participant.note}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {/* ─────────── Sumarse ─────────── */}
      <Modal
        className="w-11/12 max-w-md max-h-[88vh] overflow-y-auto"
        isOpen={isJoinOpen}
        onClose={() => setJoinOpen(false)}
        title="Sumar mi conjunto"
      >
        <div className="space-y-4">
          <p className={modal.text}>
            Tu conjunto entra a la negociación de{" "}
            <strong className={modal.strong}>{demandCategoryLabel(demand)}</strong>.
            Sumarse no obliga a contratar: cuando haya oferta grupal, cada
            conjunto la lleva a decisión de su consejo o de su presidente.
            {demand.joinDeadline
              ? ` Puedes salirte hasta el ${fmtDate(demand.joinDeadline, true)}, cuando cierran las adhesiones.`
              : ""}
          </p>
          <div>
            <label className={modal.label} htmlFor="join-cost">
              ¿Cuánto paga hoy tu conjunto por este servicio, al mes?{" "}
              <span className="font-normal text-slate-400">(opcional)</span>
            </label>
            <input
              id="join-cost"
              type="number"
              min={0}
              className={modal.input}
              placeholder="Ej: 3500000"
              value={joinCost}
              onChange={(e) => setJoinCost(e.target.value)}
            />
            <p className={`mt-1 ${modal.muted}`}>
              Sirve para mostrar cuánto ahorra el grupo. Si ya contratas este
              servicio por la plataforma, lo tomamos solo.
            </p>
          </div>
          <div>
            <label className={modal.label} htmlFor="join-note">
              Algo que el club deba saber <span className="font-normal text-slate-400">(opcional)</span>
            </label>
            <textarea
              id="join-note"
              rows={3}
              className={modal.input}
              placeholder="Tamaño, urgencia, condiciones…"
              value={joinNote}
              onChange={(e) => setJoinNote(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <Button colVariant="default" size="sm" rounded="md" onClick={() => setJoinOpen(false)}>
              Cancelar
            </Button>
            <Button
              colVariant="primary"
              size="sm"
              rounded="md"
              disabled={joinMutation.isLoading}
              onClick={() => joinMutation.mutate()}
            >
              {joinMutation.isLoading ? "Sumando…" : "Sumar mi conjunto"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─────────── Retirar la convocatoria ─────────── */}
      <Modal
        className="w-11/12 max-w-md max-h-[88vh] overflow-y-auto"
        isOpen={isCancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Retirar la convocatoria"
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            {demand.joinedCount > 0
              ? `Hay ${demand.joinedCount} ${
                  demand.joinedCount === 1 ? "conjunto sumado" : "conjuntos sumados"
                } contando con esta convocatoria. Explica por qué la retiras.`
              : "Explica por qué retiras esta convocatoria."}
          </div>
          <div>
            <label className={modal.label} htmlFor="demand-cancel">
              Motivo
            </label>
            <textarea
              id="demand-cancel"
              rows={3}
              className={modal.input}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <p className={`mt-1 text-xs ${missingReason > 0 ? "text-amber-700" : "text-emerald-700"}`}>
              {missingReason > 0 ? `Faltan ${missingReason} caracteres` : "Motivo suficiente"}
            </p>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
            <Button colVariant="default" size="sm" rounded="md" onClick={() => setCancelOpen(false)}>
              Volver
            </Button>
            <Button
              colVariant="danger"
              size="sm"
              rounded="md"
              disabled={missingReason > 0 || cancelMutation.isLoading}
              onClick={() => cancelMutation.mutate()}
            >
              {cancelMutation.isLoading ? "Retirando…" : "Retirar"}
            </Button>
          </div>
        </div>
      </Modal>

      <DemandFormModal
        isOpen={isEditOpen}
        onClose={() => setEditOpen(false)}
        demand={demand}
        isSaving={updateMutation.isLoading}
        onSubmit={({ title, description, desiredStartDate, joinDeadline, currentMonthlyCost }) =>
          updateMutation.mutate({
            title,
            description,
            desiredStartDate,
            joinDeadline,
            currentMonthlyCost,
          })
        }
      />
    </div>
  );
}
