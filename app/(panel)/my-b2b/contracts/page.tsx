"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Modal,
  SelectField,
  TextAreaField,
  Title,
  Text,
} from "complexes-next-components";
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
import { B2bNav } from "../_components/b2b-nav";

const STATUS_LABELS: Record<B2bContractStatus, string> = {
  pending: "Pendiente de confirmación",
  active: "Activo",
  rejected: "Rechazado",
  cancelled: "Cancelado",
  suspended: "Suspendido por falta de pago",
};

const STATUS_COLORS: Record<B2bContractStatus, string> = {
  pending: "text-amber-400",
  active: "text-emerald-400",
  rejected: "text-red-400",
  cancelled: "text-slate-500",
  suspended: "text-orange-400",
};

const CATEGORY_LABELS: Record<B2bCancellationReason, string> =
  B2B_CANCELLATION_REASONS.reduce(
    (acc, r) => ({ ...acc, [r.value]: r.label }),
    {} as Record<B2bCancellationReason, string>,
  );

export default function MyB2bContractsPage() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);

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
    queryClient.invalidateQueries({
      queryKey: ["my_b2b_contracts", conjuntoId],
    });

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

  const isActiveCancel = cancelTarget?.status === "active";
  const minLength = isActiveCancel
    ? CANCEL_REASON_MIN_ACTIVE
    : CANCEL_REASON_MIN_PENDING;
  const remaining = minLength - reason.trim().length;
  const canSubmitCancel =
    remaining <= 0 && (!isActiveCancel || category !== "");

  return (
    <div className="w-full p-2">
      <Title size="sm" font="bold" className="text-white">
        Mis contratos B2B
      </Title>

      <B2bNav />

      {isLoading ? (
        <Text size="sm" className="text-slate-400 mt-6">Cargando...</Text>
      ) : contracts && contracts.length > 0 ? (
        <div className="grid gap-3 mt-6">
          {contracts.map((c: B2bContract) => (
            <div
              key={c.id}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 flex justify-between gap-3"
            >
              <div className="min-w-0">
                <Text size="sm" font="semi" className="text-slate-100">
                  {c.planName}{" "}
                  <span className={`ml-2 text-xs ${STATUS_COLORS[c.status]}`}>
                    {STATUS_LABELS[c.status]}
                  </span>
                </Text>
                <Text size="xs" className="text-slate-400">
                  {c.comercio?.businessName ?? ""}
                </Text>
                <Text size="sm" className="text-slate-200 mt-1">
                  {c.amount} {c.currency} / {c.billingPeriod}
                  {c.pricingModel === "por_apartamento" && c.quantityapt
                    ? ` (${c.quantityapt} apt)`
                    : ""}
                </Text>

                {/* Enterarse de la deuda cuando ya te cortaron el servicio no
                    es enterarse: aquí se ve antes de que el proveedor pueda
                    suspender. */}
                {c.outstanding && c.outstanding.amount > 0 ? (
                  <Text
                    size="xs"
                    colVariant={
                      c.outstanding.overdueAmount > 0 ? "danger" : undefined
                    }
                    className={
                      c.outstanding.overdueAmount > 0
                        ? "mt-1"
                        : "text-slate-400 mt-1"
                    }
                  >
                    Pendiente por pagar:{" "}
                    {c.outstanding.amount.toLocaleString("es-CO")} {c.currency}{" "}
                    en {c.outstanding.count} factura
                    {c.outstanding.count === 1 ? "" : "s"}
                    {c.outstanding.overdueAmount > 0
                      ? ` · ${c.outstanding.overdueAmount.toLocaleString("es-CO")} vencidos hace ${c.outstanding.daysOverdue} día${c.outstanding.daysOverdue === 1 ? "" : "s"}`
                      : ""}
                  </Text>
                ) : null}

                {c.rejectionReason ? (
                  <Text size="xs" colVariant="danger" className="mt-1">
                    Rechazado: {c.rejectionReason}
                  </Text>
                ) : null}

                {c.status === "suspended" ? (
                  <Text size="xs" colVariant="warning" className="mt-1">
                    {c.suspensionReason
                      ? `Suspendido: ${c.suspensionReason}`
                      : "Servicio suspendido por facturas vencidas."}{" "}
                    Se reactiva al ponerte al día.
                  </Text>
                ) : null}

                {c.cancellationReason ? (
                  <Text size="xs" className="text-slate-400 mt-1">
                    Cancelada
                    {c.cancellationCategory
                      ? ` (${CATEGORY_LABELS[c.cancellationCategory]})`
                      : ""}
                    : {c.cancellationReason}
                  </Text>
                ) : null}

                {c.myRating ? (
                  <div className="mt-2">
                    <StarRating value={c.myRating.rating} showValue={false} />
                    {c.myRating.comment ? (
                      <Text size="xs" className="text-slate-500 mt-1">
                        “{c.myRating.comment}”
                      </Text>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                {c.status === "pending" || c.status === "active" ? (
                  <Button
                    colVariant="danger"
                    size="xs"
                    rounded="md"
                    onClick={() => setCancelTarget(c)}
                  >
                    Cancelar
                  </Button>
                ) : null}

                {c.canRate ? (
                  <Button
                    colVariant="primary"
                    size="xs"
                    rounded="md"
                    onClick={() => setRateTarget(c)}
                  >
                    Calificar
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Text size="sm" className="text-slate-400 mt-6">
          Aún no has solicitado ningún contrato.
        </Text>
      )}

      {/* ─────────── Cancelar alianza ─────────── */}
      <Modal
        isOpen={!!cancelTarget}
        onClose={closeCancel}
        title={
          isActiveCancel ? "Cancelar alianza activa" : "Cancelar solicitud"
        }
      >
        <div className="space-y-4 p-2">
          {isActiveCancel ? (
            <Text size="sm" className="text-amber-300">
              Esta alianza está vigente con{" "}
              <strong>{cancelTarget?.comercio?.businessName}</strong>. Debes
              indicar una causal y explicar el motivo; quedará registrado.
            </Text>
          ) : (
            <Text size="sm" className="text-slate-400">
              Cuéntanos por qué retiras la solicitud de{" "}
              <strong>{cancelTarget?.planName}</strong>.
            </Text>
          )}

          {isActiveCancel ? (
            <SelectField
              options={B2B_CANCELLATION_REASONS.map((r) => ({
                label: r.label,
                value: r.value,
              }))}
              defaultOption="Selecciona una causal"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              sizeHelp="xs"
              inputSize="md"
              rounded="md"
            />
          ) : null}

          <TextAreaField
            placeholder={
              isActiveCancel
                ? "Explica con detalle el motivo de la cancelación"
                : "Motivo de la cancelación"
            }
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-md border bg-gray-200 px-3 py-2 text-sm"
          />

          <Text size="sm"
            className={`text-xs ${remaining > 0 ? "text-amber-400" : "text-emerald-400"}`}
          >
            {remaining > 0
              ? `Faltan ${remaining} caracteres (mínimo ${minLength})`
              : "Motivo suficiente"}
          </Text>

          <Button
            colVariant="danger"
            size="full"
            rounded="md"
            disabled={!canSubmitCancel || cancelMut.isLoading}
            onClick={() =>
              cancelTarget &&
              cancelMut.mutate({
                id: cancelTarget.id,
                data: {
                  reason: reason.trim(),
                  category: isActiveCancel
                    ? (category as B2bCancellationReason)
                    : undefined,
                },
              })
            }
          >
            {cancelMut.isLoading ? "Cancelando..." : "Confirmar cancelación"}
          </Button>
        </div>
      </Modal>

      {/* ─────────── Calificar comercio ─────────── */}
      <Modal
        isOpen={!!rateTarget}
        onClose={closeRate}
        title={`Calificar a ${rateTarget?.comercio?.businessName ?? "el comercio"}`}
      >
        <div className="space-y-4 p-2">
          <Text size="sm" className="text-slate-400">
            Tu calificación construye la reputación de esta empresa ante otros
            conjuntos. Solo puedes calificarla una vez por alianza.
          </Text>

          <div className="flex justify-center">
            <StarInput
              value={stars}
              onChange={setStars}
              disabled={rateMut.isLoading}
            />
          </div>

          <TextAreaField
            placeholder="Comentario (opcional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full rounded-md border bg-gray-200 px-3 py-2 text-sm"
          />

          <Button
            colVariant="primary"
            size="full"
            rounded="md"
            disabled={stars < 1 || rateMut.isLoading}
            onClick={() =>
              rateTarget &&
              rateMut.mutate({
                contractId: rateTarget.id,
                data: {
                  rating: stars,
                  comment: comment.trim() || undefined,
                },
              })
            }
          >
            {rateMut.isLoading ? "Enviando..." : "Enviar calificación"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
