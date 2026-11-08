"use client";

import React from "react";
import { Button } from "complexes-next-components";
import { Pill, Tone, ui } from "@/app/(panel)/my-b2b/_components/b2b-ui";
import { useParcelPhoto } from "../../hooks/useParcelPhoto";
import {
  CANCEL_KIND_LABEL,
  CANCEL_KIND_STATUS,
  daysWaiting,
  Parcel,
  parcelDate,
  ParcelStatus,
  parcelUnit,
  REFUSAL_KIND_LABEL,
} from "../../services/parcelService";

const STATUS: Record<ParcelStatus, { label: string; tone: Tone }> = {
  PENDING: { label: "En portería", tone: "warning" },
  DELIVERED: { label: "Entregado", tone: "success" },
  CANCELLED: { label: "Anulado", tone: "neutral" },
  REFUSED: { label: "No recibido", tone: "danger" },
};

/** Los mismos plazos en que el backend le insiste a la unidad y a la administración. */
const OVERDUE_DAYS = 3;
const VERY_OVERDUE_DAYS = 7;

interface Props {
  parcel: Parcel;
  conjuntoId: string;
  onDeliver: (parcel: Parcel) => void;
  onCancel: (parcel: Parcel) => void;
}

export default function ParcelCard({
  parcel,
  conjuntoId,
  onDeliver,
  onCancel,
}: Props) {
  const photo = useParcelPhoto(parcel.id, conjuntoId, Boolean(parcel.photo));
  const status = STATUS[parcel.status];
  const isLost = parcel.cancelKind === "LOST";
  const statusLabel = parcel.cancelKind
    ? CANCEL_KIND_STATUS[parcel.cancelKind]
    : status.label;

  const waiting = parcel.status === "PENDING" ? daysWaiting(parcel) : 0;

  /*
    Lo que respondió la unidad sobre la entrega. "Entregado" solo es la palabra
    del celador hasta que la unidad lo confirma; si lo desmiente, la
    administración ya recibió la alerta.
  */
  const receipt =
    parcel.status !== "DELIVERED"
      ? null
      : parcel.receiptAnswer === "CONFIRMED"
        ? { label: "Confirmado por la unidad", tone: "success" as Tone }
        : parcel.receiptAnswer === "DISPUTED"
          ? { label: "La unidad dice que no lo recibió", tone: "danger" as Tone }
          : parcel.awaitingReceipt
            ? { label: "Esperando confirmación de la unidad", tone: "info" as Tone }
            : { label: "La unidad no confirmó", tone: "neutral" as Tone };

  const details = [
    parcel.quantity > 1 ? `${parcel.quantity} paquetes` : null,
    parcel.carrier,
    parcel.description,
    parcel.trackingNumber ? `Guía ${parcel.trackingNumber}` : null,
  ].filter(Boolean);

  return (
    <article className={`${ui.card} flex flex-col gap-3 p-4`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={`text-sm font-bold ${ui.strong}`}>
            {parcelUnit(parcel)}
          </p>
          {parcel.recipientName && (
            <p className={`text-xs ${ui.muted}`}>
              Para {parcel.recipientName}
            </p>
          )}
        </div>
        <Pill tone={isLost ? "danger" : status.tone}>{statusLabel}</Pill>
      </div>

      {(parcel.urgent ||
        parcel.damaged ||
        parcel.registeredLate ||
        receipt ||
        waiting >= OVERDUE_DAYS) && (
        <div className="flex flex-wrap gap-1.5">
          {receipt && <Pill tone={receipt.tone}>{receipt.label}</Pill>}
          {parcel.urgent && <Pill tone="danger">Urgente</Pill>}
          {parcel.damaged && <Pill tone="danger">Llegó dañado</Pill>}
          {waiting >= OVERDUE_DAYS && (
            <Pill tone={waiting >= VERY_OVERDUE_DAYS ? "danger" : "warning"}>
              Lleva {waiting} días
            </Pill>
          )}
          {parcel.registeredLate && (
            <Pill tone="warning">Registrado tarde</Pill>
          )}
        </div>
      )}

      <div className="flex gap-3">
        {photo && (
          <a href={photo} target="_blank" rel="noreferrer" className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo}
              alt="Foto del paquete"
              className="h-20 w-20 rounded-lg object-cover"
            />
          </a>
        )}

        <div className="min-w-0 flex-1">
          <p className={`text-sm ${ui.text}`}>
            {details.length ? details.join(" · ") : "Sin detalles"}
          </p>
          <p className={`mt-1 text-xs ${ui.muted}`}>
            Llegó {parcelDate(parcel.receivedAt)}
            {parcel.receivedBy?.name
              ? ` · lo recibió ${parcel.receivedBy.name}`
              : ""}
          </p>

          {parcel.registeredLate && (
            <p className={`mt-1 text-xs ${ui.muted}`}>
              Se anotó el {parcelDate(parcel.createdAt)}
            </p>
          )}

          {parcel.status === "DELIVERED" && parcel.deliveredAt && (
            <p className={`mt-1 text-xs ${ui.muted}`}>
              Lo retiró {parcel.deliveredToName}
              {parcel.deliveredToDocument
                ? ` (${parcel.deliveredToDocument})`
                : ""}{" "}
              el {parcelDate(parcel.deliveredAt)}
              {parcel.deliveredBy?.name
                ? ` · lo entregó ${parcel.deliveredBy.name}`
                : ""}
            </p>
          )}

          {parcel.status === "DELIVERED" &&
            parcel.receiptAnswer &&
            parcel.receiptAnsweredAt && (
              <p
                className={`mt-1 text-xs ${
                  parcel.receiptAnswer === "DISPUTED"
                    ? "font-medium text-red-600 dark:text-red-300"
                    : ui.muted
                }`}
              >
                {parcel.receiptAnswer === "CONFIRMED"
                  ? "Confirmó que lo recibió"
                  : "Dijo que no lo recibió"}
                {parcel.receiptAnsweredBy?.name
                  ? ` ${parcel.receiptAnsweredBy.name}`
                  : " la unidad"}{" "}
                el {parcelDate(parcel.receiptAnsweredAt)}
              </p>
            )}

          {parcel.status === "REFUSED" && (
            <p className={`mt-1 text-xs ${ui.muted}`}>
              {parcel.refusalKind
                ? REFUSAL_KIND_LABEL[parcel.refusalKind]
                : "No se recibió"}
              {parcel.refusalReason ? `: ${parcel.refusalReason}` : ""}
            </p>
          )}

          {parcel.status === "CANCELLED" && (
            <p className={`mt-1 text-xs ${ui.muted}`}>
              {parcel.cancelKind
                ? CANCEL_KIND_LABEL[parcel.cancelKind]
                : "Anulado"}
              {parcel.cancelledAt
                ? ` el ${parcelDate(parcel.cancelledAt)}`
                : ""}
              : {parcel.cancelReason}
            </p>
          )}
        </div>
      </div>

      {parcel.status === "PENDING" && (
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            size="sm"
            rounded="md"
            colVariant="warning"
            onClick={() => onCancel(parcel)}
          >
            Cerrar sin entregar
          </Button>
          <Button
            type="button"
            size="sm"
            rounded="md"
            colVariant="primary"
            onClick={() => onDeliver(parcel)}
          >
            Entregar
          </Button>
        </div>
      )}
    </article>
  );
}
