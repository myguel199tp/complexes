"use client";

import { Modal, Button, Text } from "complexes-next-components";
import React, { useState } from "react";
import { ImSpinner9 } from "react-icons/im";
import {
  useBlockDatesMutation,
  useHollidayAvailability,
  useHollidayBlockedDates,
  useHostBlockedDates,
  useUnblockDatesMutation,
} from "./use-block-dates";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  hollidayId: string;
}

// `YYYY-MM-DD` al mediodía: a medianoche UTC en Colombia cae el día anterior.
const formatDate = (dateStr: string): string =>
  dateStr
    ? new Date(`${dateStr.slice(0, 10)}T12:00:00`).toLocaleDateString("es-CO")
    : "-";

const toggleIn = (list: string[], date: string) =>
  list.includes(date) ? list.filter((d) => d !== date) : [...list, date];

/**
 * Bloquear días libres y quitar los bloqueos propios. Lo que apartó una
 * reserva o vendió una plataforma externa no aparece para desbloquear: se
 * suelta solo cuando esa reserva o estadía se cancela.
 */
export default function ModalBlockDates({
  isOpen,
  onClose,
  hollidayId,
}: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [toUnblock, setToUnblock] = useState<string[]>([]);

  const {
    data: availability = [],
    isLoading: loadingAvail,
    error: errorAvail,
  } = useHollidayAvailability(hollidayId, isOpen);

  const { data: blocked = [] } = useHollidayBlockedDates(hollidayId, isOpen);
  const { data: hostBlocked = [] } = useHostBlockedDates(hollidayId, isOpen);

  const block = useBlockDatesMutation(hollidayId);
  const unblock = useUnblockDatesMutation(hollidayId);
  const busy = block.isPending || unblock.isPending;

  const freeDays = availability.filter((d) => !d.isBooked && !d.isBlocked);

  const handleBlock = () => {
    if (selected.length === 0) return;
    block.mutate(selected, {
      onSuccess: () => {
        setSelected([]);
        alert("Fechas bloqueadas correctamente");
      },
      onError: (e) => {
        alert(e instanceof Error ? e.message : "Error al bloquear fechas");
      },
    });
  };

  const handleUnblock = () => {
    if (toUnblock.length === 0) return;
    unblock.mutate(toUnblock, {
      onSuccess: () => {
        setToUnblock([]);
        alert("Fechas desbloqueadas: vuelven a estar a la venta");
      },
      onError: (e) => {
        alert(e instanceof Error ? e.message : "Error al desbloquear fechas");
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[35vh] overflow-y-auto pr-1">
          {freeDays.map((day) => {
            const isSel = selected.includes(day.date);
            return (
              <button
                key={day.id}
                type="button"
                onClick={() => setSelected((prev) => toggleIn(prev, day.date))}
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

      <div className="flex justify-end mt-3">
        <Button
          onClick={handleBlock}
          colVariant="success"
          disabled={busy || selected.length === 0}
        >
          {block.isPending ? (
            <ImSpinner9 className="animate-spin" />
          ) : (
            `Bloquear (${selected.length})`
          )}
        </Button>
      </div>

      {hostBlocked.length > 0 && (
        <div className="mt-5 border-t border-gray-200 pt-4">
          <Text size="sm" font="semi" className="text-gray-700">
            Tus bloqueos
          </Text>
          <Text size="xs" className="mb-2 text-gray-500">
            Toca los que quieras volver a poner a la venta.
          </Text>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[25vh] overflow-y-auto pr-1">
            {hostBlocked.map((date) => {
              const isSel = toUnblock.includes(date);
              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => setToUnblock((prev) => toggleIn(prev, date))}
                  className={`text-sm rounded-lg border px-2 py-2 transition ${
                    isSel
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                  }`}
                >
                  {formatDate(date)}
                </button>
              );
            })}
          </div>
          <div className="flex justify-end mt-3">
            <Button
              onClick={handleUnblock}
              colVariant="primary"
              disabled={busy || toUnblock.length === 0}
            >
              {unblock.isPending ? (
                <ImSpinner9 className="animate-spin" />
              ) : (
                `Desbloquear (${toUnblock.length})`
              )}
            </Button>
          </div>
        </div>
      )}

      {blocked.length > hostBlocked.length && (
        <Text size="xs" className="text-gray-400 mt-3">
          {blocked.length - hostBlocked.length} fecha(s) más están reservadas o
          vendidas en otra plataforma: se liberan solas si esa reserva se
          cancela.
        </Text>
      )}

      <div className="flex justify-end gap-3 mt-5">
        <Button onClick={onClose} disabled={busy} colVariant="danger" rounded="md">
          Cerrar
        </Button>
      </div>
    </Modal>
  );
}
