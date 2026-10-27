"use client";

import { Button, Buton, Modal, Text } from "complexes-next-components";
import React from "react";
import {
  formatMoney,
  PLAN_LABEL,
  PublicationQuote,
} from "../../services/publicationFeeService";

interface Props {
  quote: PublicationQuote | null;
  isPaying: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Cobro por publicar por encima de los cupos gratis del plan. Se muestra el
 * desglose antes de cobrar, nunca después.
 *
 * El Modal de la librería es blanco en los dos temas: aquí van colores claros.
 */
export default function ModalPublicationPayment({
  quote,
  isPaying,
  onClose,
  onConfirm,
}: Props) {
  if (!quote) return null;

  const plan = PLAN_LABEL[quote.plan] ?? quote.plan;
  const taxPercent = `${Math.round(quote.taxRate * 100)} %`;

  return (
    <Modal
      isOpen
      onClose={isPaying ? () => undefined : onClose}
      title="Pagar la publicación"
      className="w-[95%] max-w-md"
    >
      <div className="flex flex-col gap-4 p-2">
        {quote.simulated && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <Text size="sm" className="text-blue-800">
              Modo de prueba: todavía no hay pasarela de pagos conectada. El
              pago no mueve dinero real.
            </Text>
          </div>
        )}

        <Text size="sm" className="text-gray-700">
          {quote.freeSlots === 0
            ? `Con el plan ${plan} cada publicación tiene costo.`
            : `Tu plan ${plan} incluye ${quote.freeSlots} publicación${quote.freeSlots === 1 ? "" : "es"} gratis a la vez y ya ${quote.freeSlots === 1 ? "está" : "están"} en uso.`}{" "}
          La publicación dura 30 días.
        </Text>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Publicación de inmueble</span>
            <span className="font-semibold text-gray-900">
              {formatMoney(quote.amount, quote.currency)}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>IVA ({taxPercent})</span>
            <span className="font-semibold text-gray-900">
              {formatMoney(quote.taxAmount, quote.currency)}
            </span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2">
            <span className="text-sm font-bold text-gray-900">Total</span>
            <span className="text-lg font-bold text-gray-900">
              {formatMoney(quote.total, quote.currency)}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-4">
          <Buton
            colVariant="none"
            borderWidth="none"
            onClick={onClose}
            disabled={isPaying}
            className="px-4 py-2"
          >
            Cancelar
          </Buton>
          <Button
            colVariant="success"
            onClick={onConfirm}
            disabled={isPaying}
            className="px-5 py-2"
          >
            {isPaying
              ? "Publicando…"
              : `Pagar ${formatMoney(quote.total, quote.currency)} y publicar`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
