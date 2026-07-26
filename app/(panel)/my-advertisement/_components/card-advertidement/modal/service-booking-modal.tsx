"use client";

import React, { useMemo, useState } from "react";
import { Modal, Text, Title, Button } from "complexes-next-components";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Clock, Loader2 } from "lucide-react";

import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { DataBookingServices } from "../../../services/bookingService";
import {
  AVAILABILITY_REASON_LABELS,
  AvailabilitySlot,
} from "../../../services/response/marketplaceResponse";
import { ServiceItem } from "../../../services/response/advertisementResponse";
import {
  PAYMENT_METHOD_LABELS,
  PaymentMethod,
} from "../../../services/request/orderRequest";
import { useMutationBooking } from "./use-mutation-booking";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceItem | null;
  sellerName: string;
}

const api = new DataBookingServices();

/** Los próximos 14 días, para no obligar al vecino a escribir una fecha. */
function nextDays(count: number) {
  const today = new Date();

  return Array.from({ length: count }, (_, offset) => {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);

    // Formato local "YYYY-MM-DD" sin pasar por UTC, que correría un día.
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(date.getDate()).padStart(2, "0")}`;

    return {
      iso,
      weekday: date.toLocaleDateString("es-CO", { weekday: "short" }),
      dayNumber: date.getDate(),
      month: date.toLocaleDateString("es-CO", { month: "short" }),
      isToday: offset === 0,
    };
  });
}

/**
 * Reserva de un servicio.
 *
 * Un servicio no se mete al carrito: se agenda. Por eso este modal pide fecha
 * y franja en vez de cantidad, y la disponibilidad la calcula el backend
 * cruzando el horario del negocio, la duración del servicio y las citas ya
 * tomadas. Antes no existía ninguna forma de adquirir un servicio.
 */
export default function ServiceBookingModal({
  isOpen,
  onClose,
  service,
  sellerName,
}: Props) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const apartment = useConjuntoStore((state) => state.apartment);

  const days = useMemo(() => nextDays(14), []);

  const [selectedDate, setSelectedDate] = useState(days[0].iso);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(
    null,
  );
  const [message, setMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.CASH,
  );

  const mutation = useMutationBooking(() => {
    setSelectedSlot(null);
    setMessage("");
    onClose();
  });

  const { data, isLoading } = useQuery({
    queryKey: ["availability", service?.id, selectedDate, conjuntoId],
    queryFn: () => api.availability(conjuntoId, service!.id, selectedDate),
    enabled: isOpen && !!service?.id && !!conjuntoId,
  });

  if (!service) return null;

  const slots = data?.slots ?? [];

  const handleConfirm = () => {
    if (!selectedSlot) return;

    mutation.mutate({
      serviceId: service.id,
      startAt: selectedSlot.startAt,
      unitId: apartment ?? undefined,
      message: message.trim() || undefined,
      preferredPaymentMethod: paymentMethod,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      className="!w-[96%] md:!w-[720px] max-h-[92vh] overflow-y-auto !rounded-3xl"
    >
      <div className="p-5 md:p-7 space-y-6">
        {/* Encabezado */}
        <div className="space-y-1">
          <Text size="xs" className="uppercase tracking-widest text-cyan-700">
            {sellerName}
          </Text>

          <Title className="text-2xl font-bold">{service.name}</Title>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
              <Clock size={14} className="text-cyan-600" />
              {service.durationMinutes} min
            </span>

            <span className="text-xl font-bold text-cyan-700">
              ${Number(service.price).toLocaleString("es-CO")}
            </span>
          </div>

          {service.description && (
            <Text size="sm" className="text-gray-500 pt-2">
              {service.description}
            </Text>
          )}
        </div>

        {/* Fecha */}
        <div className="space-y-2">
          <Text size="sm" font="semi" className="flex items-center gap-2">
            <CalendarDays size={16} className="text-cyan-600" />
            Elige el día
          </Text>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {days.map((day) => {
              const active = day.iso === selectedDate;

              return (
                <button
                  key={day.iso}
                  type="button"
                  onClick={() => {
                    setSelectedDate(day.iso);
                    setSelectedSlot(null);
                  }}
                  className={`min-w-[64px] shrink-0 rounded-2xl border px-3 py-2 text-center transition-all ${
                    active
                      ? "border-cyan-500 bg-cyan-50 text-cyan-800 shadow-sm"
                      : "border-gray-200 text-gray-600 hover:border-cyan-300"
                  }`}
                >
                  <span className="block text-[11px] capitalize">
                    {day.isToday ? "Hoy" : day.weekday}
                  </span>
                  <span className="block text-lg font-bold leading-tight">
                    {day.dayNumber}
                  </span>
                  <span className="block text-[10px] capitalize text-gray-400">
                    {day.month}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Franjas */}
        <div className="space-y-2">
          <Text size="sm" font="semi" className="flex items-center gap-2">
            <Clock size={16} className="text-cyan-600" />
            Elige la hora
          </Text>

          {isLoading ? (
            <div className="flex items-center gap-2 py-6 text-gray-500">
              <Loader2 size={18} className="animate-spin" />
              <Text size="sm">Consultando disponibilidad...</Text>
            </div>
          ) : slots.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 py-8 text-center">
              <Text size="sm" className="text-gray-500">
                {data?.reason
                  ? AVAILABILITY_REASON_LABELS[data.reason]
                  : "No quedan horarios libres ese día"}
              </Text>
              <Text size="xs" className="text-gray-400 mt-1">
                Prueba con otra fecha.
              </Text>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {slots.map((slot) => {
                const active = selectedSlot?.startAt === slot.startAt;

                return (
                  <button
                    key={slot.startAt}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`rounded-xl border py-2.5 text-sm font-medium transition-all ${
                      active
                        ? "border-cyan-500 bg-cyan-600 text-white shadow-md"
                        : "border-gray-200 text-gray-700 hover:border-cyan-400 hover:bg-cyan-50"
                    }`}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Detalles */}
        <div className="space-y-3">
          <label className="block">
            <Text size="sm" font="semi">
              ¿Cómo piensas pagar?
            </Text>
            <select
              value={paymentMethod}
              onChange={(e) =>
                setPaymentMethod(e.target.value as PaymentMethod)
              }
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-cyan-500"
            >
              {Object.values(PaymentMethod).map((value) => (
                <option key={value} value={value}>
                  {PAYMENT_METHOD_LABELS[value]}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <Text size="sm" font="semi">
              Detalles para el vendedor
            </Text>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Dirección exacta, qué necesitas, referencias..."
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-cyan-500"
            />
          </label>
        </div>

        {/* Resumen y confirmación */}
        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Text size="xs" className="text-gray-500">
                Tu cita
              </Text>
              <Text font="bold" className="text-gray-900">
                {selectedSlot
                  ? `${selectedDate} · ${selectedSlot.label}`
                  : "Selecciona una franja"}
              </Text>
            </div>

            <Text font="bold" size="lg" className="text-cyan-700">
              ${Number(service.price).toLocaleString("es-CO")}
            </Text>
          </div>

          <Text size="xs" className="text-gray-500">
            El vendedor debe confirmar la cita. El pago se acuerda directamente
            con él.
          </Text>

          <Button
            colVariant="success"
            className="w-full h-11 font-semibold"
            disabled={!selectedSlot || mutation.isPending}
            onClick={handleConfirm}
          >
            {mutation.isPending ? "Enviando..." : "Solicitar cita"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
