"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal, Text } from "complexes-next-components";
import { Button, TextAreaField } from "@/app/components/ui/form";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { cancelVisit } from "@/app/(panel)/my-citofonia/services/citofonieCancelService";
import { VisitorSpotOccupancy } from "../services/parkingSpotService";

const MIN_REASON = 5;

/** Los casos de siempre en portería, para no escribirlos cada vez. */
const QUICK_REASONS = [
  "El visitante se fue sin esperar",
  "El residente no contestó",
  "Registro duplicado",
];

/**
 * Cancela una visita que retiene una celda sin que nadie la resolviera.
 *
 * Antes la celda quedaba ocupada 12 horas por un carro que ya se había ido: la
 * única salida era `deny`, que la registraba como rechazo del residente y le
 * avisaba de algo que nunca hizo.
 */
export function CancelVisitModal({
  conjuntoId,
  occupancy,
  onClose,
}: {
  conjuntoId: string;
  occupancy: VisitorSpotOccupancy | null;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);

  const close = () => {
    setReason("");
    onClose();
  };

  const mutation = useMutation({
    mutationFn: (visitId: string) =>
      cancelVisit(conjuntoId, visitId, reason.trim()),
    onSuccess: () => {
      showAlert(
        `Visita cancelada: la celda ${occupancy?.code} quedó libre`,
        "success",
      );
      queryClient.invalidateQueries({ queryKey: ["visitor-occupancy"] });
      queryClient.invalidateQueries({ queryKey: ["parking-availability"] });
      queryClient.invalidateQueries({ queryKey: ["visitor-free-spots"] });
      close();
    },
    onError: (error: Error) =>
      showAlert(error.message || "No se pudo cancelar la visita", "error"),
  });

  if (!occupancy) return null;

  const valid = reason.trim().length >= MIN_REASON;

  return (
    <Modal isOpen title="Cancelar visita" onClose={close}>
      <div className="p-6">
        <Text className="mb-1">
          <strong>{occupancy.namevisit}</strong> — Apto {occupancy.apartment}
          {occupancy.plaque ? ` — ${occupancy.plaque}` : ""}
        </Text>
        <Text size="sm" className="mb-4 text-gray-600">
          Celda {occupancy.code}
          {occupancy.status === "PENDING"
            ? " · esperando autorización del residente"
            : " · autorizado, aún no ingresa"}
        </Text>

        <div className="mb-3 flex flex-wrap gap-2">
          {QUICK_REASONS.map((quick) => (
            <button
              key={quick}
              type="button"
              onClick={() => setReason(quick)}
              className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                reason === quick
                  ? "border-cyan-600 bg-cyan-50 font-semibold text-cyan-800"
                  : "border-gray-300 text-gray-600 hover:border-cyan-500"
              }`}
            >
              {quick}
            </button>
          ))}
        </div>

        <TextAreaField
          placeholder="¿Por qué se cancela la visita?"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mb-2 w-full"
          rows={3}
        />

        <Text size="xs" className="mb-4 text-gray-500">
          La visita queda como cancelada en la bitácora con tu nombre y este
          motivo, y al residente le llega un aviso.
        </Text>

        <div className="flex justify-end gap-3">
          <Button onClick={close} disabled={mutation.isPending}>
            Volver
          </Button>
          <Button
            colVariant="danger"
            disabled={!valid || mutation.isPending}
            onClick={() => mutation.mutate(occupancy.visitId)}
          >
            {mutation.isPending ? "Cancelando..." : "Cancelar visita"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
