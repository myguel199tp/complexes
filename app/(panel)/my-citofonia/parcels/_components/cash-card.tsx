"use client";

import React from "react";
import { Button } from "@/app/components/ui/form";
import { Pill, Tone, ui } from "@/app/(panel)/my-b2b/_components/b2b-ui";
import {
  CashAnswer,
  money,
  ParcelCashRow,
  parcelDate,
  parcelUnit,
} from "../../services/parcelService";

const ANSWER: Record<CashAnswer, { label: string; tone: Tone }> = {
  CONFIRMED: { label: "La unidad lo confirmó", tone: "success" },
  DISPUTED: { label: "La unidad dice que no es correcto", tone: "danger" },
};

/** Plata de un residente que sigue en portería. */
export default function CashCard({
  cash,
  onReturn,
}: {
  cash: ParcelCashRow;
  onReturn: (cash: ParcelCashRow) => void;
}) {
  const answer = cash.receiptAnswer ? ANSWER[cash.receiptAnswer] : null;

  return (
    <article className={`${ui.card} flex flex-col gap-3 p-4`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={`text-sm font-bold ${ui.strong}`}>{parcelUnit(cash)}</p>
          <p className={`text-xs ${ui.muted}`}>
            {[cash.expectedParcel?.carrier, cash.expectedParcel?.description]
              .filter(Boolean)
              .join(" · ") || "Paquete contraentrega"}
          </p>
        </div>
        <p className={`text-lg font-bold ${ui.strong}`}>{money(cash.held)}</p>
      </div>

      <div className={`text-xs ${ui.muted}`}>
        <p>
          Dejó {money(cash.amount)} el {parcelDate(cash.receivedAt)}
          {cash.receivedBy?.name ? ` · lo recibió ${cash.receivedBy.name}` : ""}
        </p>
        {cash.paidAmount != null && (
          <p>
            Se pagaron {money(cash.paidAmount)}: quedan {money(cash.held)} de vueltas
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {answer ? (
          <Pill tone={answer.tone}>{answer.label}</Pill>
        ) : (
          <Pill tone="neutral">La unidad no ha confirmado</Pill>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          rounded="md"
          colVariant="primary"
          onClick={() => onReturn(cash)}
        >
          Devolver {money(cash.held)}
        </Button>
      </div>
    </article>
  );
}
