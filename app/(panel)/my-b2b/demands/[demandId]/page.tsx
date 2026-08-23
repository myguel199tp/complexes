"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Modal, TextAreaField, Title } from "complexes-next-components";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { B2bNav } from "../../_components/b2b-nav";
import { DemandFormModal } from "../_components/demand-form-modal";
import {
  DEMAND_CANCEL_REASON_MIN,
  DEMAND_STATUS_COLORS,
  DEMAND_STATUS_LABELS,
  UpdateB2bDemandPayload,
  cancelB2bDemand,
  demandCategoryLabel,
  getB2bDemand,
  joinB2bDemand,
  leaveB2bDemand,
  updateB2bDemand,
} from "../../services/b2bDemandService";

function formatDate(value?: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

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
    mutationFn: () => joinB2bDemand(conjuntoId, demandId, { note: joinNote }),
    onSuccess: () => {
      setJoinOpen(false);
      setJoinNote("");
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
    mutationFn: () =>
      cancelB2bDemand(conjuntoId, demandId, { reason: cancelReason }),
    onSuccess: () => {
      setCancelOpen(false);
      setCancelReason("");
      invalidate();
      showAlert("Convocatoria retirada", "success");
    },
    onError,
  });

  if (isLoading) {
    return <p className="text-slate-400 text-sm p-4">Cargando...</p>;
  }

  if (!demand) {
    return (
      <div className="p-4">
        <p className="text-slate-400 text-sm">Convocatoria no encontrada.</p>
        <Link href="/my-b2b/demands" className="text-cyan-300 text-sm">
          ← Volver a necesidades
        </Link>
      </div>
    );
  }

  const isEditable = demand.status === "open" || demand.status === "grouping";
  const missingReason = Math.max(
    0,
    DEMAND_CANCEL_REASON_MIN - cancelReason.trim().length,
  );

  return (
    <div className="w-full p-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-cyan-300 text-xs">{demandCategoryLabel(demand)}</p>
          <Title size="sm" font="bold" className="text-white">
            {demand.title}
          </Title>
          <p className="text-slate-400 text-xs mt-1">
            {demand.city} ·{" "}
            {demand.isOwner
              ? "Publicada por tu conjunto"
              : (demand.conjuntoName ?? "Otro conjunto")}
            <span className={`ml-2 ${DEMAND_STATUS_COLORS[demand.status]}`}>
              {DEMAND_STATUS_LABELS[demand.status]}
            </span>
          </p>
        </div>
        <Link
          href="/my-b2b/demands"
          className="text-cyan-300 text-sm hover:text-cyan-200 shrink-0"
        >
          ← Necesidades
        </Link>
      </div>

      <B2bNav />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-slate-200 text-sm whitespace-pre-line">
            {demand.description}
          </p>

          <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
            {demand.desiredStartDate ? (
              <div>
                <p className="text-slate-500">Inicio deseado</p>
                <p className="text-slate-200">
                  {formatDate(demand.desiredStartDate)}
                </p>
              </div>
            ) : null}
            <div>
              <p className="text-slate-500">Publicada</p>
              <p className="text-slate-200">{formatDate(demand.createdAt)}</p>
            </div>
          </div>

          {demand.outcomeNote ? (
            <p className="text-emerald-300 text-xs mt-4">
              Nota del club: {demand.outcomeNote}
            </p>
          ) : null}

          {demand.cancellationReason ? (
            <p className="text-slate-400 text-xs mt-4">
              Retirada: {demand.cancellationReason}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2 mt-5">
            {demand.canJoin.allowed ? (
              <Button
                colVariant="primary"
                size="sm"
                rounded="md"
                onClick={() => setJoinOpen(true)}
              >
                Sumar mi conjunto
              </Button>
            ) : null}

            {demand.hasJoined ? (
              <Button
                colVariant="danger"
                size="sm"
                rounded="md"
                disabled={leaveMutation.isPending}
                onClick={() => leaveMutation.mutate()}
              >
                Salir de la convocatoria
              </Button>
            ) : null}

            {demand.isOwner && isEditable ? (
              <>
                <Button
                  colVariant="default"
                  size="sm"
                  rounded="md"
                  onClick={() => setEditOpen(true)}
                >
                  Editar
                </Button>
                <Button
                  colVariant="danger"
                  size="sm"
                  rounded="md"
                  onClick={() => setCancelOpen(true)}
                >
                  Retirar
                </Button>
              </>
            ) : null}

            {/* El backend explica por qué no se puede unir; se muestra tal cual. */}
            {!demand.canJoin.allowed &&
            !demand.hasJoined &&
            !demand.isOwner &&
            demand.canJoin.reason ? (
              <p className="text-slate-500 text-xs self-center">
                {demand.canJoin.reason}
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-slate-100 font-semibold text-sm">
            {demand.totalConjuntos}{" "}
            {demand.totalConjuntos === 1 ? "conjunto" : "conjuntos"}
          </p>
          {demand.totalApartamentos > 0 ? (
            <p className="text-slate-400 text-xs">
              {demand.totalApartamentos} apartamentos en total
            </p>
          ) : null}

          <div className="grid gap-2 mt-4">
            {demand.participants.map((participant) => (
              <div
                key={participant.conjuntoId}
                className="rounded-md border border-white/5 bg-white/[0.03] p-2"
              >
                <p className="text-slate-100 text-sm">
                  {participant.conjuntoName}
                  {participant.isOwner ? (
                    <span className="text-cyan-300 text-xs ml-2">Publica</span>
                  ) : null}
                </p>
                <p className="text-slate-500 text-xs">
                  {participant.city}
                  {participant.quantityapt
                    ? ` · ${participant.quantityapt} apt`
                    : ""}
                </p>
                {participant.note ? (
                  <p className="text-slate-400 text-xs mt-1">
                    {participant.note}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────── Sumarse ─────────── */}
      <Modal
        isOpen={isJoinOpen}
        onClose={() => setJoinOpen(false)}
        title="Sumar mi conjunto"
      >
        <div className="space-y-4 p-2">
          <p className="text-sm text-slate-400">
            Tu conjunto entra a la negociación de{" "}
            <strong>{demandCategoryLabel(demand)}</strong>. Sumarse no obliga a
            contratar: cuando haya precio, cada conjunto decide.
          </p>
          <TextAreaField
            placeholder="Algo que el club deba saber (tamaño, urgencia, condiciones). Opcional."
            value={joinNote}
            onChange={(e) => setJoinNote(e.target.value)}
            className="w-full rounded-md border bg-gray-200 px-3 py-2 text-sm"
          />
          <div className="flex justify-end gap-2">
            <Button
              colVariant="default"
              size="sm"
              rounded="md"
              onClick={() => setJoinOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              colVariant="primary"
              size="sm"
              rounded="md"
              disabled={joinMutation.isPending}
              onClick={() => joinMutation.mutate()}
            >
              {joinMutation.isPending ? "Sumando..." : "Sumar mi conjunto"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ─────────── Retirar la convocatoria ─────────── */}
      <Modal
        isOpen={isCancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Retirar la convocatoria"
      >
        <div className="space-y-4 p-2">
          <p className="text-sm text-amber-300">
            {demand.joinedCount > 0
              ? `Hay ${demand.joinedCount} ${
                  demand.joinedCount === 1 ? "conjunto sumado" : "conjuntos sumados"
                } contando con esta convocatoria. Explica por qué la retiras.`
              : "Explica por qué retiras esta convocatoria."}
          </p>
          <TextAreaField
            placeholder="Motivo"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="w-full rounded-md border bg-gray-200 px-3 py-2 text-sm"
          />
          <p
            className={`text-xs ${
              missingReason > 0 ? "text-amber-400" : "text-emerald-400"
            }`}
          >
            {missingReason > 0
              ? `Faltan ${missingReason} caracteres`
              : "Motivo suficiente"}
          </p>
          <div className="flex justify-end gap-2">
            <Button
              colVariant="default"
              size="sm"
              rounded="md"
              onClick={() => setCancelOpen(false)}
            >
              Volver
            </Button>
            <Button
              colVariant="danger"
              size="sm"
              rounded="md"
              disabled={missingReason > 0 || cancelMutation.isPending}
              onClick={() => cancelMutation.mutate()}
            >
              {cancelMutation.isPending ? "Retirando..." : "Retirar"}
            </Button>
          </div>
        </div>
      </Modal>

      <DemandFormModal
        isOpen={isEditOpen}
        onClose={() => setEditOpen(false)}
        demand={demand}
        isSaving={updateMutation.isPending}
        onSubmit={({ title, description, desiredStartDate }) =>
          updateMutation.mutate({ title, description, desiredStartDate })
        }
      />
    </div>
  );
}
