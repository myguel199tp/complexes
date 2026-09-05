"use client";

import { useState } from "react";
import { Text, Title } from "complexes-next-components";
import QrScanner from "@/app/components/ui/qr-scanner/QrScanner";
import {
  useAssignedReservations,
  useValidateReservation,
} from "./use-activity-scan";
import { ValidatedReservationResponse } from "../services/activityScanService";

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

/**
 * El colaborador escanea el QR que le muestra el residente y ve, en una sola
 * pantalla, a quién tiene enfrente y qué dejó anotado al reservar.
 *
 * La agenda del día está debajo porque el caso normal no es escanear a ciegas:
 * el encargado llega sabiendo a quién espera y usa el escáner para confirmar.
 */
export default function ActivityScan() {
  const { data: agenda, isLoading: loadingAgenda } = useAssignedReservations();
  const mutation = useValidateReservation();

  const [result, setResult] = useState<ValidatedReservationResponse | null>(
    null,
  );
  const [deniedMessage, setDeniedMessage] = useState<string | null>(null);

  const handleScan = (code: string) => {
    mutation.mutate(code, {
      onSuccess: (data) => {
        setDeniedMessage(null);
        setResult(data);
      },
      onError: (error: Error) => {
        setResult(null);
        setDeniedMessage(error.message);
      },
    });
  };

  const reset = () => {
    setResult(null);
    setDeniedMessage(null);
  };

  return (
    <div className="p-4">
      <Title colVariant="on" size="md" font="bold" as="h3" className="mb-4">
        Validar reserva de actividad
      </Title>

      {!result && !deniedMessage && (
        <QrScanner
          onScan={handleScan}
          hint="Apunta la cámara al código QR de la reserva"
        />
      )}

      {result && (
        <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-5">
          <Title as="h4" font="bold" size="md" className="text-green-800">
            Reserva válida
          </Title>

          <Text size="sm" className="mt-1 text-green-900">
            {result.activity} · {formatTime(result.reservationDate)}
          </Text>

          <dl className="mt-4 space-y-2 border-t border-green-200 pt-4 text-sm">
            {result.holder && (
              <div className="flex justify-between gap-4">
                <dt className="text-green-700">Residente</dt>
                <dd className="font-medium text-green-900">
                  {result.holder.name}
                </dd>
              </div>
            )}

            {result.apartment && (
              <div className="flex justify-between gap-4">
                <dt className="text-green-700">Apartamento</dt>
                <dd className="font-medium text-green-900">
                  {result.apartment}
                </dd>
              </div>
            )}

            <div className="flex justify-between gap-4">
              <dt className="text-green-700">Asistentes</dt>
              <dd className="font-medium text-green-900">
                {result.people} ({result.adultsCount} adulto(s)
                {result.minorsCount > 0
                  ? `, ${result.minorsCount} menor(es)`
                  : ""}
                )
              </dd>
            </div>

            {/* Lo que el residente pidió al reservar: el motivo de la pantalla. */}
            {result.suggestions && (
              <div className="rounded-xl bg-white/70 p-3">
                <dt className="text-green-700">Sugerencias del residente</dt>
                <dd className="mt-1 text-green-900">{result.suggestions}</dd>
              </div>
            )}
          </dl>

          <button
            onClick={reset}
            className="mt-5 rounded-xl bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800 transition"
          >
            Escanear otra
          </button>
        </div>
      )}

      {deniedMessage && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-5">
          <Title as="h4" font="bold" size="md" className="text-red-800">
            No se pudo validar
          </Title>

          <Text size="sm" className="mt-1 text-red-900">
            {deniedMessage}
          </Text>

          <button
            onClick={reset}
            className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition"
          >
            Volver a escanear
          </button>
        </div>
      )}

      <section className="mt-8">
        <Title colVariant="on" size="sm" font="bold" as="h4">
          Agenda de hoy
        </Title>

        {loadingAgenda && (
          <Text size="sm" className="mt-2 text-gray-500">
            Cargando…
          </Text>
        )}

        {!loadingAgenda && (!agenda || agenda.length === 0) && (
          <Text size="sm" className="mt-2 text-gray-500">
            No tienes reservas asignadas para hoy.
          </Text>
        )}

        <div className="mt-3 space-y-2">
          {agenda?.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-gray-800">
                  {formatTime(item.reservation_date)} · {item.activityName}
                </span>

                <span
                  className={
                    item.status === "USED"
                      ? "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                      : "rounded-full bg-cyan-100 px-3 py-1 text-xs font-semibold text-cyan-700"
                  }
                >
                  {item.status === "USED" ? "Ya ingresó" : "Pendiente"}
                </span>
              </div>

              <Text size="sm" className="mt-2 text-gray-600">
                {`${item.holderName ?? ""} ${item.holderLastName ?? ""}`.trim() ||
                  "Sin titular"}
                {item.apartment ? ` · Apto ${item.apartment}` : ""} ·{" "}
                {item.adultsCount + item.minorsCount} persona(s)
              </Text>

              {item.description && (
                <Text size="sm" className="mt-2 italic text-gray-500">
                  “{item.description}”
                </Text>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
