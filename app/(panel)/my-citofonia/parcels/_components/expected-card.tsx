"use client";

import React from "react";
import { Button } from "complexes-next-components";
import { Pill, ui } from "@/app/(panel)/my-b2b/_components/b2b-ui";
import {
  ExpectedParcel,
  expectedDayLabel,
  heldOf,
  money,
  parcelUnit,
} from "../../services/parcelService";

interface Props {
  expected: ExpectedParcel;
  onArrived: (expected: ExpectedParcel) => void;
  /** Solo si el conjunto permite que portería reciba plata. */
  onReceiveCash?: (expected: ExpectedParcel) => void;
}

/** Un paquete que un residente avisó que va a llegar. */
export default function ExpectedCard({
  expected,
  onArrived,
  onReceiveCash,
}: Props) {
  const cash = expected.cash;
  const day = expectedDayLabel(expected.expectedDate);

  return (
    <article className={`${ui.card} flex flex-col gap-3 p-4`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={`text-sm font-bold ${ui.strong}`}>
            {parcelUnit(expected)}
          </p>
          {expected.createdBy?.name && (
            <p className={`text-xs ${ui.muted}`}>
              Avisó {expected.createdBy.name}
            </p>
          )}
        </div>
        <Pill tone={day.overdue ? "danger" : day.today ? "warning" : "info"}>
          {day.label}
        </Pill>
      </div>

      <div>
        <p className={`text-sm ${ui.text}`}>
          {[expected.carrier, expected.description].filter(Boolean).join(" · ") ||
            "Sin detalles"}
        </p>
        {expected.notes && (
          <p className={`mt-1 text-xs ${ui.muted}`}>“{expected.notes}”</p>
        )}
      </div>

      {(expected.cashOnDelivery || cash) && (
        <div className="flex flex-wrap gap-1.5">
          {expected.cashOnDelivery && <Pill tone="warning">Contraentrega</Pill>}
          {cash && cash.status === "HELD" && (
            <Pill tone="success">Dejó {money(heldOf(cash))} en portería</Pill>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2">
        {onReceiveCash && !cash && (
          <Button
            type="button"
            size="sm"
            rounded="md"
            colVariant="warning"
            onClick={() => onReceiveCash(expected)}
          >
            Recibir dinero
          </Button>
        )}
        <Button
          type="button"
          size="sm"
          rounded="md"
          colVariant="primary"
          onClick={() => onArrived(expected)}
        >
          Llegó
        </Button>
      </div>
    </article>
  );
}
