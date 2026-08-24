"use client";

import { Modal, Text } from "complexes-next-components";
import React from "react";
import { ImSpinner9 } from "react-icons/im";
import { FaUserCircle } from "react-icons/fa";
import { useOwnerGuestsQuery } from "./use-owner-guests-query";
import { formatCurrency } from "@/app/_helpers/format-currency";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  hollidayId: string;
}

const formatDate = (dateStr: string): string =>
  dateStr ? new Date(dateStr).toLocaleDateString("es-CO") : "-";

export default function ModalGuests({ isOpen, onClose, hollidayId }: Props) {
  const {
    data: guests = [],
    isLoading,
    error,
  } = useOwnerGuestsQuery(hollidayId, isOpen);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Huéspedes actuales">
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <ImSpinner9 className="animate-spin text-cyan-800" size={36} />
        </div>
      ) : error ? (
        <Text size="sm" className="text-red-500 py-6 text-center">
          No pudimos cargar los huéspedes.
        </Text>
      ) : guests.length === 0 ? (
        <Text size="sm" className="text-gray-500 py-6 text-center">
          No hay huéspedes dentro del inmueble hoy.
        </Text>
      ) : (
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {guests.map((g) => (
            <div
              key={g.bookingId}
              className="border rounded-lg p-3 bg-white shadow-sm"
            >
              <div className="flex items-center gap-2 mb-2">
                <FaUserCircle className="text-cyan-700" size={22} />
                <span className="font-semibold text-gray-800">
                  {g.huesped?.nombre || "Huésped"}
                </span>
              </div>

              <div className="text-xs text-gray-600 grid grid-cols-1 sm:grid-cols-2 gap-1">
                <Text size="sm">📧 {g.huesped?.email || "-"}</Text>
                <Text size="sm">📞 {g.huesped?.telefono || "-"}</Text>
                <Text size="sm">🪪 {g.huesped?.documento || "-"}</Text>
                <Text size="sm">
                  🛏️ {formatDate(g.fechas?.entrada)} →{" "}
                  {formatDate(g.fechas?.salida)}
                </Text>
                <Text size="sm">👥 {g.pasajeros ?? 0} pasajeros</Text>
                <Text size="sm">💵 {formatCurrency(g.totalPagado || 0)}</Text>
                {(g.huesped?.contactoEmergencia?.nombre ||
                  g.huesped?.contactoEmergencia?.telefono) && (
                  <Text size="sm" className="sm:col-span-2">
                    🚨 Emergencia:{" "}
                    {g.huesped?.contactoEmergencia?.nombre || "-"}{" "}
                    {g.huesped?.contactoEmergencia?.telefono || ""}
                  </Text>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}
