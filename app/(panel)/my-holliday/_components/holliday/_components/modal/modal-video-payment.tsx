"use client";

import React from "react";
import { Modal, Text } from "complexes-next-components";
import { Button } from "@/app/components/ui/form";

import {
  formatCop,
  ListingVideoQuote,
} from "../../../../services/listingVideoService";

interface Props {
  video: ListingVideoQuote | null;
  isPaying: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Pagar el video subido antes de publicar el inmueble (Básico y Oro). Se
 * muestra el desglose antes de cobrar, nunca después. El Modal de la
 * librería es blanco en los dos temas: colores claros.
 */
export default function ModalVideoPayment({
  video,
  isPaying,
  onClose,
  onConfirm,
}: Props) {
  if (!video) return null;

  const taxPercent = `${Math.round(video.taxRate * 100)} %`;

  return (
    <Modal
      isOpen
      onClose={isPaying ? () => undefined : onClose}
      title="Pagar el video"
      className="w-[95%] max-w-md"
    >
      <div className="flex flex-col gap-4 p-2">
        {video.simulated && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <Text size="sm" className="text-blue-800">
              Modo de prueba: todavía no hay pasarela de pagos conectada. El
              pago no mueve dinero real.
            </Text>
          </div>
        )}

        <Text size="sm" className="text-gray-700">
          El video subido se paga una sola vez por inmueble; si después lo
          cambias, no se vuelve a cobrar. El enlace de YouTube es gratis y en el
          plan Platino el video viene incluido.
        </Text>

        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Video de la propiedad</span>
            <span className="font-semibold text-gray-900">
              {formatCop(video.amount, video.currency)}
            </span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>IVA ({taxPercent})</span>
            <span className="font-semibold text-gray-900">
              {formatCop(video.taxAmount, video.currency)}
            </span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2">
            <span className="text-sm font-bold text-gray-900">Total</span>
            <span className="text-lg font-bold text-gray-900">
              {formatCop(video.total, video.currency)}
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-4">
          <Button
            colVariant="none"
            onClick={onClose}
            disabled={isPaying}
            className="px-4 py-2"
          >
            Cancelar
          </Button>
          <Button
            colVariant="success"
            onClick={onConfirm}
            disabled={isPaying}
            className="px-5 py-2"
          >
            {isPaying
              ? "Publicando…"
              : `Pagar ${formatCop(video.total, video.currency)} y publicar`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
