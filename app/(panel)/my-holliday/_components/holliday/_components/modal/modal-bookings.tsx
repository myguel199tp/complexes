"use client";

import { Modal, Text } from "complexes-next-components";
import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImSpinner9 } from "react-icons/im";
import { FaUserCircle } from "react-icons/fa";
import { formatCurrency } from "@/app/_helpers/format-currency";
import {
  markArrivedService,
  markNoShowService,
  ownerBookingsService,
  ownerCancelBookingService,
} from "../../../../services/ownerBookingsService";
import {
  BookingSettlementView,
  OwnerBooking,
  OwnerBookingStage,
} from "../../../../services/response/ownerBookingsResponse";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  hollidayId: string;
}

const formatDay = (day?: string | null): string =>
  day ? new Date(`${day}T12:00:00`).toLocaleDateString("es-CO") : "-";

const TABS: { key: string; label: string; stages: OwnerBookingStage[] }[] = [
  { key: "proximas", label: "Próximas", stages: ["proxima", "pendiente"] },
  { key: "en_curso", label: "En curso", stages: ["en_curso"] },
  {
    key: "terminadas",
    label: "Terminadas",
    stages: ["terminada", "no_se_presento"],
  },
  { key: "canceladas", label: "Canceladas", stages: ["cancelada"] },
];

const SETTLEMENT_LABEL: Record<BookingSettlementView["estado"], string> = {
  pending: "La plataforma lo tiene hasta que termine la estadía",
  ready: "Por girarte",
  paid: "Ya se te giró",
  void: "Reembolso total: no hay nada que girar",
};

const STAGE_LABEL: Record<OwnerBookingStage, string> = {
  pendiente: "Sin confirmar",
  proxima: "Confirmada",
  en_curso: "En curso",
  terminada: "Terminada",
  no_se_presento: "No se presentó",
  cancelada: "Cancelada",
};

const STAGE_STYLE: Record<OwnerBookingStage, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  proxima: "bg-green-100 text-green-800",
  en_curso: "bg-cyan-100 text-cyan-800",
  terminada: "bg-slate-100 text-slate-700",
  no_se_presento: "bg-orange-100 text-orange-800",
  cancelada: "bg-red-100 text-red-700",
};

/** Reservas del inmueble, para que el anfitrión vea lo que viene y lo que pasó. */
export default function ModalBookings({ isOpen, onClose, hollidayId }: Props) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState(TABS[0].key);
  const [error, setError] = useState<string | null>(null);

  const {
    data: bookings = [],
    isLoading,
    error: loadError,
  } = useQuery<OwnerBooking[]>({
    queryKey: ["owner-bookings", hollidayId],
    queryFn: () => ownerBookingsService(hollidayId),
    enabled: isOpen && !!hollidayId,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const cancel = useMutation({
    mutationFn: ownerCancelBookingService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-bookings", hollidayId] });
      queryClient.invalidateQueries({ queryKey: ["owner-guests", hollidayId] });
    },
    onError: (e) =>
      setError(e instanceof Error ? e.message : "No se pudo cancelar la reserva"),
  });

  // Llegada y no-show: la misma recarga que cancelar.
  const hostAction = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "arrived" | "no-show" }) =>
      action === "arrived" ? markArrivedService(id) : markNoShowService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-bookings", hollidayId] });
      queryClient.invalidateQueries({ queryKey: ["owner-guests", hollidayId] });
      queryClient.invalidateQueries({ queryKey: ["pending-guest-reviews"] });
    },
    onError: (e) =>
      setError(e instanceof Error ? e.message : "No se pudo actualizar la reserva"),
  });

  const handleNoShow = (booking: OwnerBooking) => {
    const ok = confirm(
      `¿${booking.huesped.nombre} no llegó? Se liberan las noches que quedan, su código de portería deja de servir y el alojamiento no se le devuelve (el aseo y el depósito sí).`,
    );
    if (!ok) return;
    setError(null);
    hostAction.mutate({ id: booking.bookingId, action: "no-show" });
  };

  const counts = useMemo(
    () =>
      Object.fromEntries(
        TABS.map((t) => [
          t.key,
          bookings.filter((b) => t.stages.includes(b.etapa)).length,
        ]),
      ),
    [bookings],
  );

  const visible = bookings.filter((b) =>
    TABS.find((t) => t.key === tab)?.stages.includes(b.etapa),
  );

  const handleCancel = (booking: OwnerBooking) => {
    const ok = confirm(
      `¿Cancelar la reserva de ${booking.huesped.nombre} del ${formatDay(
        booking.fechas.entrada,
      )}? El huésped pierde el código de portería y las noches vuelven a quedar libres.`,
    );
    if (!ok) return;
    setError(null);
    cancel.mutate(booking.bookingId);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reservas del inmueble"
      className="!w-[94%] md:!w-[560px] max-w-[96vw]"
    >
      <div className="mb-3 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              tab === t.key
                ? "border-cyan-700 bg-cyan-700 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {t.label} ({counts[t.key] ?? 0})
          </button>
        ))}
      </div>

      {error && (
        <Text size="sm" className="mb-2 text-red-600">
          {error}
        </Text>
      )}

      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <ImSpinner9 className="animate-spin text-cyan-800" size={36} />
        </div>
      ) : loadError ? (
        <Text size="sm" className="py-6 text-center text-red-500">
          No pudimos cargar las reservas.
        </Text>
      ) : visible.length === 0 ? (
        <Text size="sm" className="py-6 text-center text-slate-500">
          No hay reservas en esta pestaña.
        </Text>
      ) : (
        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {visible.map((b) => (
            <div
              key={b.bookingId}
              className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <FaUserCircle className="shrink-0 text-cyan-700" size={22} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">
                      {b.huesped.nombre || "Huésped"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {b.huesped.calificacion
                        ? `★ ${b.huesped.calificacion.promedio} (${b.huesped.calificacion.total})`
                        : "Sin calificaciones"}
                    </p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${STAGE_STYLE[b.etapa]}`}
                >
                  {STAGE_LABEL[b.etapa]}
                </span>
              </div>

              <div className="mt-2 grid grid-cols-1 gap-1 text-xs text-slate-600 sm:grid-cols-2">
                <span>
                  🛏️ {formatDay(b.fechas.entrada)} → {formatDay(b.fechas.salida)}{" "}
                  · {b.noches} {b.noches === 1 ? "noche" : "noches"}
                </span>
                <span>👥 {b.pasajeros} pasajeros</span>
                <span>💵 {formatCurrency(b.totalPagado || 0)}</span>
                {b.huesped.telefono && <span>📞 {b.huesped.telefono}</span>}
                {b.huesped.email && (
                  <span className="sm:col-span-2">📧 {b.huesped.email}</span>
                )}
              </div>

              {b.llegada && (
                <p className="mt-2 text-xs text-emerald-700">
                  ✅ Llegó el{" "}
                  {new Date(b.llegada).toLocaleString("es-CO", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </p>
              )}

              {b.liquidacion && <SettlementBox settlement={b.liquidacion} />}

              {(b.puedeMarcarLlegada || b.puedeMarcarNoShow) && (
                <div className="mt-3 flex gap-2">
                  {b.puedeMarcarLlegada && (
                    <button
                      type="button"
                      onClick={() =>
                        hostAction.mutate({
                          id: b.bookingId,
                          action: "arrived",
                        })
                      }
                      disabled={hostAction.isPending}
                      className="flex-1 rounded-lg bg-emerald-50 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                    >
                      Llegó
                    </button>
                  )}
                  {b.puedeMarcarNoShow && (
                    <button
                      type="button"
                      onClick={() => handleNoShow(b)}
                      disabled={hostAction.isPending}
                      className="flex-1 rounded-lg bg-orange-50 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-100 disabled:opacity-50"
                    >
                      No se presentó
                    </button>
                  )}
                </div>
              )}

              {b.puedeCancelar && (
                <button
                  type="button"
                  onClick={() => handleCancel(b)}
                  disabled={cancel.isPending}
                  className="mt-3 w-full rounded-lg bg-red-50 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
                >
                  {cancel.isPending ? "Cancelando..." : "Cancelar reserva"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

/** Cuánto pagó el huésped y cuánto le queda al anfitrión de esta reserva. */
function SettlementBox({ settlement }: { settlement: BookingSettlementView }) {
  const rows: [string, number][] = [
    ["Pagó el huésped", settlement.pagoHuesped],
    ["Reembolso al huésped", -settlement.reembolsoHuesped],
    ["Depósito de vuelta al huésped", -settlement.devolucionDeposito],
    [
      `Comisión de la plataforma (${settlement.comisionPorcentaje} %)`,
      -settlement.comision,
    ],
  ];

  return (
    <div className="mt-2 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-600">
      {rows
        .filter(([, value]) => value !== 0)
        .map(([label, value]) => (
          <div key={label} className="flex justify-between">
            <span>{label}</span>
            <span>{formatCurrency(value)}</span>
          </div>
        ))}
      <div className="mt-1 flex justify-between border-t border-slate-200 pt-1 font-semibold text-slate-900">
        <span>Para ti</span>
        <span>{formatCurrency(settlement.paraAnfitrion)}</span>
      </div>
      <p className="mt-1 text-[11px] text-slate-500">
        {SETTLEMENT_LABEL[settlement.estado]}
      </p>
    </div>
  );
}
