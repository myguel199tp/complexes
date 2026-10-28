"use client";

import { Button, Buton, Modal, Text } from "complexes-next-components";
import React from "react";
import { formatCurrency } from "@/app/_helpers/format-currency";
import {
  CONTENT_LABELS,
  ContentModule,
  PackageOffer,
} from "./content-quota-service";

interface Props {
  module: ContentModule;
  offer: PackageOffer | null;
  simulated: boolean;
  isPaying: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Compra de un paquete de noticias o de documentos. Se muestra el desglose con
 * IVA antes de cobrar, nunca después.
 *
 * El Modal de la librería es blanco en los dos temas: aquí van colores claros.
 */
export default function PackagePurchaseModal({
  module,
  offer,
  simulated,
  isPaying,
  onClose,
  onConfirm,
}: Props) {
  if (!offer) return null;

  const label = CONTENT_LABELS[module];
  const taxPercent = `${Math.round(offer.taxRate * 100)} %`;

  return (
    <Modal
      isOpen
      onClose={isPaying ? () => undefined : onClose}
      title={`Comprar ${offer.name}`}
      className="w-[95%] max-w-md"
    >
      <div className="flex flex-col gap-4 p-2">
        {simulated && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <Text size="sm" className="text-blue-800">
              Modo de prueba: todavía no hay pasarela de pagos conectada. El
              pago no mueve dinero real.
            </Text>
          </div>
        )}

        <Text size="sm" className="text-gray-700">
          Suma{" "}
          <strong>
            {offer.maxItems} {label.many}
          </strong>{" "}
          a {label.the} gratis de tu plan. Tienes {offer.durationDays} días
          para usar{label.the === "las" ? "las" : "los"}; {label.the} que no
          uses se pierden. Se gastan después de {label.the} gratis del mes.
        </Text>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{offer.name}</span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(offer.price)}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>IVA ({taxPercent})</span>
            <span className="font-semibold text-gray-900">
              {formatCurrency(offer.taxAmount)}
            </span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2">
            <span className="text-sm font-bold text-gray-900">Total</span>
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(offer.total)}
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
            {isPaying ? "Comprando…" : `Pagar ${formatCurrency(offer.total)}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
