"use client";

import { useState } from "react";
import { Button, TextAreaField, Text } from "complexes-next-components";
import { useResolveEmergency } from "./useEmergency";

export default function EmergencyResolveModal({
  emergencyId,
  conjuntoId,
  onClose,
}: {
  emergencyId: string;
  conjuntoId: string;
  onClose: () => void;
}) {
  const [summary, setSummary] = useState("");
  const resolveMutation = useResolveEmergency(conjuntoId);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[90%] max-w-md rounded-3xl border border-white/10 bg-[#0f172a]/95 p-6 text-white shadow-2xl">
        <Text as="h2" font="bold" className="text-lg">Resolver emergencia</Text>
        <Text size="sm" className="mt-1 text-slate-300">
          Esto marcará la emergencia como resuelta y avisará a los residentes.
        </Text>

        <TextAreaField
          label="Resumen del evento (opcional)"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
        />

        {resolveMutation.error && (
          <Text size="sm" colVariant="danger" className="mt-2">
            {resolveMutation.error.message}
          </Text>
        )}

        <div className="mt-4 flex gap-3">
          <Button
            size="full"
            colVariant="success"
            disabled={resolveMutation.isPending}
            onClick={() =>
              resolveMutation.mutate(
                { id: emergencyId, data: { summary: summary || undefined } },
                { onSuccess: onClose },
              )
            }
          >
            {resolveMutation.isPending
              ? "Resolviendo..."
              : "Confirmar resolución"}
          </Button>
          <Button size="full" colVariant="primary" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
