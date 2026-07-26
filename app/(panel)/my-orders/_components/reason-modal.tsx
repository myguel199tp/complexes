"use client";

import React, { useState } from "react";
import { Modal, Text, Title, Button } from "complexes-next-components";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  hint: string;
  confirmLabel: string;
  isLoading?: boolean;
  onConfirm: (reason: string) => void;
}

/**
 * Pide el motivo antes de rechazar o cancelar.
 *
 * El backend exige `cancellationReason` en esos dos casos: entre vecinos, un
 * "no puedo" sin explicación es lo que rompe la confianza del marketplace.
 */
export default function ReasonModal({
  isOpen,
  onClose,
  title,
  hint,
  confirmLabel,
  isLoading,
  onConfirm,
}: Props) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) return;

    onConfirm(reason.trim());
    setReason("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      className="!w-[94%] md:!w-[460px] !rounded-3xl"
    >
      <div className="p-6 space-y-4">
        <Title className="text-lg font-bold">{title}</Title>

        <Text size="sm" className="text-gray-500">
          {hint}
        </Text>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          maxLength={500}
          autoFocus
          placeholder="Escribe el motivo..."
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-cyan-500"
        />

        <div className="flex gap-3">
          <Button colVariant="default" className="flex-1" onClick={onClose}>
            Volver
          </Button>

          <Button
            colVariant="danger"
            className="flex-1"
            disabled={!reason.trim() || isLoading}
            onClick={handleConfirm}
          >
            {isLoading ? "Enviando..." : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
