"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal, Text } from "complexes-next-components";
import { Button, TextAreaField } from "@/app/components/ui/form";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  CLAIM_DESCRIPTION_MIN,
  CLAIM_MAX_PHOTOS,
  CLAIM_REASONS_NEEDING_PHOTO,
  CLAIM_REASON_LABELS,
  CLAIM_STATUS_LABELS,
  ClaimReason,
  ClaimResolution,
  MyClaim,
  MyOrder,
  SIC_ORIENTATION,
  confirmClaimRefund,
  createClaim,
  disputeClaimRefund,
  getClaimPhoto,
  withdrawClaim,
} from "../services/comercioStoreService";

const money = (value: number | string | null | undefined) =>
  `$${Number(value ?? 0).toLocaleString("es-CO")}`;

const when = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("es-CO", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

/** Las líneas que se pueden reclamar: las de productos. */
const productLines = (order: MyOrder) =>
  order.items.filter(
    (item) => (item as { itemType?: string }).itemType !== "service",
  );

const STATUS_TONE: Record<MyClaim["status"], string> = {
  open: "border-amber-200 bg-amber-50 text-amber-800",
  replacement_in_progress: "border-emerald-200 bg-emerald-50 text-emerald-800",
  refund_reported: "border-sky-200 bg-sky-50 text-sky-800",
  resolved: "border-emerald-200 bg-emerald-50 text-emerald-800",
  rejected: "border-red-200 bg-red-50 text-red-800",
  unanswered: "border-red-200 bg-red-50 text-red-800",
  no_agreement: "border-red-200 bg-red-50 text-red-800",
  withdrawn: "border-gray-200 bg-gray-50 text-gray-600",
};

/**
 * Lo del reclamo dentro de la tarjeta del pedido: el botón para reclamar
 * mientras corre el plazo, o el estado del reclamo si ya lo hay.
 */
export default function OrderClaimSection({
  order,
  claim,
  windowHours,
  conjuntoId,
}: {
  order: MyOrder;
  claim?: MyClaim | null;
  windowHours: number;
  conjuntoId: string;
}) {
  const [formOpen, setFormOpen] = useState(false);

  if (claim && claim.status !== "withdrawn") {
    return <ClaimCard claim={claim} conjuntoId={conjuntoId} />;
  }

  if (order.status !== "delivered" || !order.deliveredAt) return null;
  if (productLines(order).length === 0) return null;

  const deadline =
    new Date(order.deliveredAt).getTime() + windowHours * 3600 * 1000;
  if (Date.now() > deadline) return null;

  return (
    <div className="mt-3 border-t pt-3 flex flex-wrap items-center justify-between gap-2">
      <span className="text-xs text-gray-500">
        ¿Llegó algo dañado, en mal estado o incompleto? Puedes reclamar hasta el{" "}
        {when(new Date(deadline).toISOString())}.
      </span>
      <Button
        size="xs"
        rounded="md"
        colVariant="warning"
        variant="soft"
        onClick={() => setFormOpen(true)}
      >
        Reportar un problema
      </Button>

      {formOpen ? (
        <ClaimFormModal
          order={order}
          conjuntoId={conjuntoId}
          onClose={() => setFormOpen(false)}
        />
      ) : null}
    </div>
  );
}

function ClaimFormModal({
  order,
  conjuntoId,
  onClose,
}: {
  order: MyOrder;
  conjuntoId: string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);

  const lines = productLines(order);
  const [reason, setReason] = useState<ClaimReason | null>(null);
  const [resolution, setResolution] = useState<ClaimResolution>("replacement");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  // Por defecto todo lo que trajo el pedido, como "marcar todo".
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(lines.map((line) => [line.id, line.quantity])),
  );

  const previews = useMemo(
    () => photos.map((photo) => URL.createObjectURL(photo)),
    [photos],
  );
  useEffect(
    () => () => previews.forEach((url) => URL.revokeObjectURL(url)),
    [previews],
  );

  const chosen = lines
    .filter((line) => (quantities[line.id] ?? 0) > 0)
    .map((line) => ({ orderItemId: line.id, quantity: quantities[line.id] }));

  const needsPhoto = !!reason && CLAIM_REASONS_NEEDING_PHOTO.includes(reason);
  const ready =
    !!reason &&
    chosen.length > 0 &&
    description.trim().length >= CLAIM_DESCRIPTION_MIN &&
    (!needsPhoto || photos.length > 0);

  const mutation = useMutation({
    mutationFn: () =>
      createClaim(conjuntoId, {
        orderId: order.id,
        reason: reason as ClaimReason,
        description: description.trim(),
        requestedResolution: resolution,
        items: chosen,
        photos,
      }),
    onSuccess: () => {
      showAlert(
        "Reclamo enviado. El comercio tiene 48 horas para responderte.",
        "success",
      );
      queryClient.invalidateQueries({ queryKey: ["store-my-claims"] });
      onClose();
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  return (
    <Modal
      className="w-11/12 max-w-lg max-h-[88vh] overflow-y-auto"
      isOpen
      onClose={onClose}
      title="Reportar un problema con el pedido"
    >
      <div className="space-y-4 p-2 text-gray-800">
        <Text size="sm" className="text-gray-600">
          El reclamo le llega a{" "}
          <strong>{order.comercio?.businessName ?? "el comercio"}</strong>, que
          es quien te vendió y responde por lo que llega con el repartidor.
        </Text>

        <div>
          <div className="text-xs font-semibold text-gray-500 mb-2">
            ¿Qué pasó?
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {(Object.keys(CLAIM_REASON_LABELS) as ClaimReason[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setReason(key)}
                className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                  reason === key
                    ? "border-amber-500 bg-amber-50 font-semibold text-amber-900"
                    : "border-gray-200 hover:border-amber-300"
                }`}
              >
                {CLAIM_REASON_LABELS[key]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-gray-500 mb-2">
            ¿Qué productos y cuántos?
          </div>
          <div className="space-y-2">
            {lines.map((line) => (
              <div
                key={line.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 px-3 py-2"
              >
                <span className="text-sm">{line.nameSnapshot}</span>
                <select
                  className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm"
                  value={quantities[line.id] ?? 0}
                  onChange={(e) =>
                    setQuantities((prev) => ({
                      ...prev,
                      [line.id]: Number(e.target.value),
                    }))
                  }
                >
                  {Array.from({ length: line.quantity + 1 }, (_, n) => (
                    <option key={n} value={n}>
                      {n === 0 ? "Nada" : `${n} de ${line.quantity}`}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-gray-500 mb-2">
            Cuéntale al comercio
          </div>
          <TextAreaField
            placeholder="Ej: la caja llegó aplastada y dos huevos rotos"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full"
          />
          {description.trim().length > 0 &&
          description.trim().length < CLAIM_DESCRIPTION_MIN ? (
            <Text size="xs" colVariant="danger">
              Escribe al menos {CLAIM_DESCRIPTION_MIN} caracteres.
            </Text>
          ) : null}
        </div>

        <div>
          <div className="text-xs font-semibold text-gray-500 mb-2">
            Fotos {needsPhoto ? "(obligatoria al menos una)" : "(opcional)"}
          </div>
          <input
            className="w-full rounded-md border bg-gray-100 px-3 py-2 text-sm"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) =>
              setPhotos(
                Array.from(e.target.files ?? []).slice(0, CLAIM_MAX_PHOTOS),
              )
            }
          />
          {previews.length > 0 ? (
            <div className="mt-2 flex gap-2">
              {previews.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={url}
                  src={url}
                  alt="Foto del reclamo"
                  className="h-16 w-16 rounded-lg object-cover border"
                />
              ))}
            </div>
          ) : null}
          <Text size="xs" className="text-gray-500 mt-1">
            Hasta {CLAIM_MAX_PHOTOS}. Solo las ven tú y el comercio.
          </Text>
        </div>

        <div>
          <div className="text-xs font-semibold text-gray-500 mb-2">
            ¿Qué prefieres?
          </div>
          <div className="flex gap-2">
            {(
              [
                ["replacement", "Que me lo repongan"],
                ["refund", "Que me devuelvan el dinero"],
              ] as [ClaimResolution, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setResolution(key)}
                className={`flex-1 rounded-xl border px-3 py-2 text-sm transition ${
                  resolution === key
                    ? "border-cyan-600 bg-cyan-50 font-semibold text-cyan-900"
                    : "border-gray-200 hover:border-cyan-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <Text size="xs" className="text-gray-500 mt-1">
            El comercio decide: puede reponer, devolver o rechazar con un
            motivo. Tiene 48 horas para responderte.
          </Text>
        </div>

        <Button
          colVariant="warning"
          size="full"
          rounded="md"
          disabled={!ready || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? "Enviando..." : "Enviar reclamo"}
        </Button>
      </div>
    </Modal>
  );
}

function ClaimPhotos({ claim, conjuntoId }: { claim: MyClaim; conjuntoId: string }) {
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    let alive = true;
    const loaded: string[] = [];
    (async () => {
      for (let index = 0; index < claim.photosCount; index++) {
        try {
          const url = await getClaimPhoto(conjuntoId, claim.id, index);
          if (!alive) {
            URL.revokeObjectURL(url);
            return;
          }
          loaded.push(url);
          setUrls([...loaded]);
        } catch {
          // Una foto que no carga no tiene por qué esconder las demás.
        }
      }
    })();
    return () => {
      alive = false;
      loaded.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [claim.id, claim.photosCount, conjuntoId]);

  if (urls.length === 0) return null;

  return (
    <div className="mt-2 flex gap-2">
      {urls.map((url) => (
        <a key={url} href={url} target="_blank" rel="noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt="Foto del reclamo"
            className="h-14 w-14 rounded-lg object-cover border"
          />
        </a>
      ))}
    </div>
  );
}

function ClaimCard({ claim, conjuntoId }: { claim: MyClaim; conjuntoId: string }) {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [note, setNote] = useState("");

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["store-my-claims"] });
    queryClient.invalidateQueries({ queryKey: ["store-my-orders"] });
  };

  const confirmMutation = useMutation({
    mutationFn: () => confirmClaimRefund(conjuntoId, claim.id),
    onSuccess: () => {
      showAlert("Listo, reclamo resuelto.", "success");
      refresh();
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const disputeMutation = useMutation({
    mutationFn: () => disputeClaimRefund(conjuntoId, claim.id, note.trim()),
    onSuccess: () => {
      showAlert("Le avisamos al comercio.", "success");
      setDisputeOpen(false);
      setNote("");
      refresh();
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const withdrawMutation = useMutation({
    mutationFn: () => withdrawClaim(conjuntoId, claim.id),
    onSuccess: () => {
      showAlert("Retiraste el reclamo.", "success");
      refresh();
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  return (
    <div className={`mt-3 rounded-xl border p-3 ${STATUS_TONE[claim.status]}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold">
          Reclamo · {CLAIM_STATUS_LABELS[claim.status]}
        </span>
        <span className="text-xs opacity-80">{when(claim.createdAt)}</span>
      </div>

      <p className="text-xs mt-1">
        {claim.reasonLabel}:{" "}
        {claim.items.map((item) => `${item.quantity}× ${item.name}`).join(", ")}
      </p>
      <p className="text-xs mt-1 italic">“{claim.description}”</p>

      <ClaimPhotos claim={claim} conjuntoId={conjuntoId} />

      {claim.status === "open" ? (
        <p className="text-xs mt-2">
          El comercio tiene hasta el {when(claim.respondBy)} para responder.
        </p>
      ) : null}

      {claim.comercioResponse ? (
        <p className="text-xs mt-2">
          <strong>El comercio:</strong> {claim.comercioResponse}
        </p>
      ) : null}

      {claim.status === "replacement_in_progress" ? (
        <p className="text-xs mt-2">
          La reposición aparece en tu lista como un pedido nuevo en $0. Cuando
          llegue, dale al repartidor el código de ese pedido.
        </p>
      ) : null}

      {claim.refundAmount !== null && claim.refundAmount !== undefined ? (
        <p className="text-xs mt-2">
          Devolución registrada: <strong>{money(claim.refundAmount)}</strong>
          {claim.refundReference ? ` · ${claim.refundReference}` : ""}
        </p>
      ) : null}

      {claim.status === "refund_reported" ? (
        <div className="mt-2 flex flex-wrap gap-2">
          <Button
            size="xs"
            rounded="md"
            colVariant="success"
            disabled={confirmMutation.isPending}
            onClick={() => confirmMutation.mutate()}
          >
            Sí, ya me llegó
          </Button>
          <Button
            size="xs"
            rounded="md"
            colVariant="danger"
            variant="soft"
            onClick={() => setDisputeOpen(true)}
          >
            No me llegó
          </Button>
        </div>
      ) : null}

      {claim.status === "open" ? (
        <Button
          size="xs"
          rounded="md"
          colVariant="default"
          variant="ghost"
          className="mt-2"
          disabled={withdrawMutation.isPending}
          onClick={() => withdrawMutation.mutate()}
        >
          Retirar el reclamo
        </Button>
      ) : null}

      {claim.withoutAgreement ? (
        <p className="text-xs mt-2 rounded-lg bg-white/70 p-2 text-gray-700">
          {SIC_ORIENTATION}
        </p>
      ) : null}

      <Modal
        className="w-11/12 max-w-md"
        isOpen={disputeOpen}
        onClose={() => setDisputeOpen(false)}
        title="No me llegó la devolución"
      >
        <div className="space-y-4 p-2">
          <Text size="sm" className="text-gray-600">
            El reclamo se cierra sin acuerdo y le avisamos al comercio. La
            plataforma no mueve el dinero, así que no puede hacer la devolución
            por él.
          </Text>
          <TextAreaField
            placeholder="Cuéntale qué pasó (opcional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full"
          />
          <Button
            colVariant="danger"
            size="full"
            rounded="md"
            disabled={disputeMutation.isPending}
            onClick={() => disputeMutation.mutate()}
          >
            {disputeMutation.isPending ? "Enviando..." : "Confirmar"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
