"use client";

import { Modal, Button, Text } from "complexes-next-components";
import React, { useState } from "react";
import { ImSpinner9 } from "react-icons/im";
import {
  useBlockDatesMutation,
  useHollidayAvailability,
  useHollidayBlockedDates,
} from "./use-block-dates";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  hollidayId: string;
}

const formatDate = (dateStr: string): string =>
  dateStr ? new Date(dateStr).toLocaleDateString("es-CO") : "-";

export default function ModalBlockDates({
  isOpen,
  onClose,
  hollidayId,
}: Props) {
  const [selected, setSelected] = useState<string[]>([]);

  const {
    data: availability = [],
    isLoading: loadingAvail,
    error: errorAvail,
  } = useHollidayAvailability(hollidayId, isOpen);

  const { data: blocked = [] } = useHollidayBlockedDates(hollidayId, isOpen);

  const { mutate, isPending } = useBlockDatesMutation(hollidayId);

  const freeDays = availability.filter((d) => !d.isBooked && !d.isBlocked);

  const toggle = (date: string) => {
    setSelected((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date],
    );
  };

  const handleBlock = () => {
    if (selected.length === 0) return;
    mutate(selected, {
      onSuccess: () => {
        setSelected([]);
        alert("Fechas bloqueadas correctamente");
        onClose();
      },
      onError: (e) => {
        alert(e instanceof Error ? e.message : "Error al bloquear fechas");
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bloquear fechas">
      <Text size="sm" className="mb-3 text-gray-600">
        Selecciona las fechas libres que quieres bloquear para que no se puedan
        reservar.
      </Text>

      {loadingAvail ? (
        <div className="flex justify-center items-center h-32">
          <ImSpinner9 className="animate-spin text-cyan-800" size={32} />
        </div>
      ) : errorAvail ? (
        <Text size="sm" className="text-red-500 py-4 text-center">
          No pudimos cargar la disponibilidad.
        </Text>
      ) : freeDays.length === 0 ? (
        <Text size="sm" className="text-gray-500 py-4 text-center">
          No hay fechas libres disponibles para bloquear.
        </Text>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[45vh] overflow-y-auto pr-1">
          {freeDays.map((day) => {
            const isSel = selected.includes(day.date);
            return (
              <button
                key={day.id}
                type="button"
                onClick={() => toggle(day.date)}
                className={`text-sm rounded-lg border px-2 py-2 transition ${
                  isSel
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {formatDate(day.date)}
              </button>
            );
          })}
        </div>
      )}

      {blocked.length > 0 && (
        <Text size="xs" className="text-gray-400 mt-3">
          Ya bloqueadas/ocupadas: {blocked.length} fecha(s).
        </Text>
      )}

      <div className="flex justify-end gap-3 mt-5">
        <Button
          onClick={onClose}
          disabled={isPending}
          colVariant="danger"
          rounded="md"
        >
          Cancelar
        </Button>

        <Button
          onClick={handleBlock}
          colVariant="success"
          disabled={isPending || selected.length === 0}
        >
          {isPending ? (
            <ImSpinner9 className="animate-spin" />
          ) : (
            `Bloquear (${selected.length})`
          )}
        </Button>
      </div>
    </Modal>
  );
}
