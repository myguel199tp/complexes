"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MdInventory2 } from "react-icons/md";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useParcelPhoto } from "@/app/(panel)/my-citofonia/hooks/useParcelPhoto";
import {
  answerCash,
  answerParcelReceipt,
  CANCEL_KIND_LABEL,
  cancelExpectedParcel,
  getMyCash,
  money,
  ParcelCashRow,
  ExpectedParcel,
  expectedDayLabel,
  getMyExpectedParcels,
  getMyParcels,
  Parcel,
  parcelDate,
  REFUSAL_KIND_LABEL,
} from "@/app/(panel)/my-citofonia/services/parcelService";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import AnnounceParcelForm from "./announce-parcel-form";

/** Sin socket aquí: un minuto es suficiente para saber que llegó algo. */
const REFRESH_MS = 60_000;

const detail = (parcel: Parcel) =>
  [
    parcel.urgent ? "Urgente" : null,
    parcel.quantity > 1 ? `${parcel.quantity} paquetes` : null,
    parcel.carrier,
    parcel.description,
    parcel.recipientName ? `para ${parcel.recipientName}` : null,
  ]
    .filter(Boolean)
    .join(" · ") || "Paquete";

/**
 * Portería marcó el paquete como entregado: la unidad confirma o lo desmiente.
 * Sin esto, "Entregado" era solo la palabra del celador. Se responde una vez;
 * si dice que no lo recibió, se entera la administración.
 */
function ReceiptQuestion({
  parcel,
  conjuntoId,
}: {
  parcel: Parcel;
  conjuntoId: string;
}) {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);

  const answer = useMutation({
    mutationFn: (received: boolean) =>
      answerParcelReceipt(conjuntoId, parcel.id, received),
    onSuccess: (_data, received) => {
      showAlert(
        received
          ? "Gracias por confirmarlo"
          : "Le avisamos a la administración",
        received ? "success" : "info",
      );
      queryClient.invalidateQueries({ queryKey: ["my-parcels"] });
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <span className="text-xs text-slate-700 dark:text-slate-300">
        Portería registró que se lo entregó a {parcel.deliveredToName}. ¿Lo
        recibiste?
      </span>
      <button
        type="button"
        disabled={answer.isLoading}
        className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        onClick={() => answer.mutate(true)}
      >
        Sí, lo recibí
      </button>
      <button
        type="button"
        disabled={answer.isLoading}
        className="rounded-md border border-red-300 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-400/40 dark:text-red-300 dark:hover:bg-red-500/10"
        onClick={() => answer.mutate(false)}
      >
        No lo recibí
      </button>
    </div>
  );
}

function ParcelRow({
  parcel,
  conjuntoId,
}: {
  parcel: Parcel;
  conjuntoId: string;
}) {
  const photo = useParcelPhoto(parcel.id, conjuntoId, Boolean(parcel.photo));

  return (
    <li className="flex gap-3 rounded-md border border-cyan-200 bg-white p-3 text-sm dark:border-white/10 dark:bg-white/[0.04]">
      {photo && (
        <a href={photo} target="_blank" rel="noreferrer" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo}
            alt="Foto del paquete"
            className="h-14 w-14 rounded-md object-cover"
          />
        </a>
      )}

      <div className="min-w-0">
        <p className="font-medium text-slate-900 dark:text-slate-100">
          {detail(parcel)}
        </p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Llegó {parcelDate(parcel.receivedAt)}
        </p>
        {parcel.damaged && (
          <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
            Llegó con daños
          </p>
        )}
        {parcel.status === "DELIVERED" && parcel.deliveredAt && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Lo retiró {parcel.deliveredToName} el{" "}
            {parcelDate(parcel.deliveredAt)}
          </p>
        )}
        {parcel.status === "DELIVERED" &&
          parcel.receiptAnswer === "CONFIRMED" && (
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
              Confirmaste que lo recibiste
            </p>
          )}
        {parcel.status === "DELIVERED" &&
          parcel.receiptAnswer === "DISPUTED" && (
            <p className="text-xs font-medium text-red-700 dark:text-red-300">
              Dijiste que no lo recibiste: la administración ya está enterada
            </p>
          )}
        {parcel.awaitingReceipt && (
          <ReceiptQuestion parcel={parcel} conjuntoId={conjuntoId} />
        )}
        {parcel.status === "REFUSED" && (
          <p className="text-xs font-medium text-red-700 dark:text-red-300">
            No se recibió:{" "}
            {parcel.refusalKind
              ? REFUSAL_KIND_LABEL[parcel.refusalKind].toLowerCase()
              : "consulta en portería"}
            {parcel.refusalReason ? ` (${parcel.refusalReason})` : ""}
          </p>
        )}
        {parcel.status === "CANCELLED" && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {parcel.cancelKind
              ? CANCEL_KIND_LABEL[parcel.cancelKind]
              : "Anulado"}
            : {parcel.cancelReason}
          </p>
        )}
      </div>
    </li>
  );
}

function ExpectedRow({
  expected,
  conjuntoId,
}: {
  expected: ExpectedParcel;
  conjuntoId: string;
}) {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);
  const day = expectedDayLabel(expected.expectedDate);

  const cancel = useMutation({
    mutationFn: () => cancelExpectedParcel(conjuntoId, expected.id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["my-expected-parcels"] }),
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  return (
    <li className="flex items-start justify-between gap-3 rounded-md border border-cyan-200 bg-white p-3 text-sm dark:border-white/10 dark:bg-white/[0.04]">
      <div className="min-w-0">
        <p className="font-medium text-slate-900 dark:text-slate-100">
          {[expected.carrier, expected.description].filter(Boolean).join(" · ") ||
            "Paquete"}
        </p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {day.overdue
            ? `${day.label}: portería no lo ha registrado. Si la transportadora dice que lo entregó, avísale a la administración.`
            : `Lo esperas: ${day.label.toLowerCase()}`}
          {expected.cashOnDelivery ? " · contraentrega" : ""}
        </p>
      </div>
      <button
        type="button"
        disabled={cancel.isLoading}
        className="shrink-0 text-xs font-medium text-slate-500 hover:underline disabled:opacity-50 dark:text-slate-400"
        onClick={() => cancel.mutate()}
      >
        Ya no lo espero
      </button>
    </li>
  );
}

/**
 * La plata que la unidad dejó en portería. Lo que portería registra se le
 * pregunta al residente: si dice que no es correcto, se entera la
 * administración. Se responde una sola vez por paso.
 */
function CashRow({ cash, conjuntoId }: { cash: ParcelCashRow; conjuntoId: string }) {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);

  const answer = useMutation({
    mutationFn: ({ stage, correct }: { stage: "receipt" | "return"; correct: boolean }) =>
      answerCash(conjuntoId, cash.id, stage, correct),
    onSuccess: (_data, { correct }) => {
      showAlert(
        correct ? "Gracias por confirmarlo" : "Le avisamos a la administración",
        correct ? "success" : "info",
      );
      queryClient.invalidateQueries({ queryKey: ["my-cash"] });
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  // Primero la devolución: es lo último que pasó.
  const question =
    cash.returnedAt && !cash.returnAnswer
      ? {
          stage: "return" as const,
          text: `Portería registró que le entregó ${money(cash.returnedAmount ?? 0)} a ${cash.returnedToName}. ¿Es correcto?`,
        }
      : !cash.receiptAnswer
        ? {
            stage: "receipt" as const,
            text: `Portería registró que le dejaste ${money(cash.amount)}. ¿Es correcto?`,
          }
        : null;

  const what =
    [cash.expectedParcel?.carrier, cash.expectedParcel?.description]
      .filter(Boolean)
      .join(" · ") || "Paquete contraentrega";

  return (
    <li className="rounded-md border border-emerald-200 bg-white p-3 text-sm dark:border-white/10 dark:bg-white/[0.04]">
      <p className="font-medium text-slate-900 dark:text-slate-100">
        {what}: dejaste {money(cash.amount)}
      </p>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
        {cash.paidAmount != null ? `Se pagaron ${money(cash.paidAmount)}. ` : ""}
        {cash.held > 0
          ? `Quedan ${money(cash.held)} en portería.`
          : cash.returnedAt
            ? `Te devolvieron ${money(cash.returnedAmount ?? 0)}.`
            : "Se usó todo para pagar."}
      </p>

      {question && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-700 dark:text-slate-300">{question.text}</span>
          <button
            type="button"
            disabled={answer.isLoading}
            className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            onClick={() => answer.mutate({ stage: question.stage, correct: true })}
          >
            Sí, es correcto
          </button>
          <button
            type="button"
            disabled={answer.isLoading}
            className="rounded-md border border-red-300 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-400/40 dark:text-red-300 dark:hover:bg-red-500/10"
            onClick={() => answer.mutate({ stage: question.stage, correct: false })}
          >
            No es correcto
          </button>
        </div>
      )}
    </li>
  );
}

/**
 * Los paquetes de la unidad del residente. El residente no entra a
 * `/my-citofonia`, así que aquí ve lo que tiene por recoger y lo ya retirado.
 */
export default function MyParcelsNotice() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const [showHistory, setShowHistory] = useState(false);
  const [announcing, setAnnouncing] = useState(false);

  const { data = [], isLoading } = useQuery({
    queryKey: ["my-parcels", conjuntoId],
    queryFn: () => getMyParcels(String(conjuntoId)),
    enabled: !!conjuntoId,
    retry: false,
    refetchInterval: REFRESH_MS,
  });

  const { data: expected, isLoading: expectedLoading } = useQuery({
    queryKey: ["my-expected-parcels", conjuntoId],
    queryFn: () => getMyExpectedParcels(String(conjuntoId)),
    enabled: !!conjuntoId,
    retry: false,
    refetchInterval: REFRESH_MS,
  });

  const { data: myCash = [] } = useQuery({
    queryKey: ["my-cash", conjuntoId],
    queryFn: () => getMyCash(String(conjuntoId)),
    enabled: !!conjuntoId,
    retry: false,
    refetchInterval: REFRESH_MS,
  });

  // Lo que sigue en portería o lo que falta confirmar.
  const cashToShow = myCash.filter(
    (cash) =>
      cash.held > 0 ||
      !cash.receiptAnswer ||
      (cash.returnedAt && !cash.returnAnswer),
  );

  const canAnnounce = expected?.canAnnounce === true;
  const waiting = (expected?.items ?? []).filter(
    (item) => item.status === "WAITING",
  );

  // El personal sin unidad no tiene nada que ver ni que avisar aquí.
  if (isLoading || expectedLoading) return null;
  if (data.length === 0 && !canAnnounce && cashToShow.length === 0) return null;

  const pending = data.filter((parcel) => parcel.status === "PENDING");
  // Lo entregado sin confirmar va arriba y no escondido en el historial: es lo
  // único que le pide algo al residente.
  const toConfirm = data.filter((parcel) => parcel.awaitingReceipt);
  const history = data.filter(
    (parcel) => parcel.status !== "PENDING" && !parcel.awaitingReceipt,
  );

  const heading = pending.length
    ? `Tienes ${pending.length} paquete${pending.length === 1 ? "" : "s"} en portería`
    : toConfirm.length
      ? `Confirma que recibiste ${toConfirm.length === 1 ? "tu paquete" : `tus ${toConfirm.length} paquetes`}`
      : "No tienes paquetes por recoger";

  return (
    <div className="mb-4 rounded-lg border border-cyan-300 bg-cyan-50 p-4 dark:border-cyan-500/30 dark:bg-cyan-500/10">
      <div className="flex items-start gap-2">
        <MdInventory2 className="mt-0.5 shrink-0 text-lg text-cyan-700 dark:text-cyan-300" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-cyan-900 dark:text-cyan-100">
            {heading}
          </p>

          {pending.length > 0 && (
            <ul className="mt-3 space-y-2">
              {pending.map((parcel) => (
                <ParcelRow
                  key={parcel.id}
                  parcel={parcel}
                  conjuntoId={String(conjuntoId)}
                />
              ))}
            </ul>
          )}

          {toConfirm.length > 0 && (
            <>
              {pending.length > 0 && (
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-cyan-800 dark:text-cyan-200">
                  Confirma lo que te entregaron
                </p>
              )}
              <ul className="mt-2 space-y-2">
                {toConfirm.map((parcel) => (
                  <ParcelRow
                    key={parcel.id}
                    parcel={parcel}
                    conjuntoId={String(conjuntoId)}
                  />
                ))}
              </ul>
            </>
          )}

          {history.length > 0 && (
            <button
              type="button"
              className="mt-2 text-xs font-medium text-cyan-800 hover:underline dark:text-cyan-200"
              onClick={() => setShowHistory((current) => !current)}
            >
              {showHistory ? "Ocultar historial" : `Ver historial (${history.length})`}
            </button>
          )}

          {showHistory && (
            <ul className="mt-2 space-y-2">
              {history.map((parcel) => (
                <ParcelRow
                  key={parcel.id}
                  parcel={parcel}
                  conjuntoId={String(conjuntoId)}
                />
              ))}
            </ul>
          )}

          {cashToShow.length > 0 && (
            <>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-200">
                Tu dinero en portería
              </p>
              <ul className="mt-2 space-y-2">
                {cashToShow.map((cash) => (
                  <CashRow key={cash.id} cash={cash} conjuntoId={String(conjuntoId)} />
                ))}
              </ul>
            </>
          )}

          {waiting.length > 0 && (
            <>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-cyan-800 dark:text-cyan-200">
                Portería sabe que esperas
              </p>
              <ul className="mt-2 space-y-2">
                {waiting.map((item) => (
                  <ExpectedRow
                    key={item.id}
                    expected={item}
                    conjuntoId={String(conjuntoId)}
                  />
                ))}
              </ul>
            </>
          )}

          {canAnnounce &&
            (announcing ? (
              <AnnounceParcelForm
                conjuntoId={String(conjuntoId)}
                onDone={() => setAnnouncing(false)}
              />
            ) : (
              <button
                type="button"
                className="mt-3 rounded-md border border-cyan-400 px-3 py-1.5 text-xs font-semibold text-cyan-800 hover:bg-cyan-100 dark:border-cyan-400/40 dark:text-cyan-200 dark:hover:bg-cyan-500/10"
                onClick={() => setAnnouncing(true)}
              >
                ¿Esperas un paquete? Avísale a portería
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
