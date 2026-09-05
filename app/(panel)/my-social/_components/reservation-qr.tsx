"use client";

import { Text, Title } from "complexes-next-components";
import { useEffect, useState } from "react";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  MyReservationResponse,
  reservationQrObjectUrl,
} from "../services/myReservationsService";

type Props = {
  reservation: MyReservationResponse;
  onClose: () => void;
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

/**
 * El QR que el residente le muestra al encargado de la actividad. La imagen se
 * pide al backend en vez de dibujarla aquí: así el código nunca se arma en el
 * cliente y una sola implementación sirve para el panel y para la app.
 */
export default function ReservationQr({ reservation, onClose }: Props) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conjuntoId) return;

    let objectUrl: string | null = null;
    let cancelled = false;

    reservationQrObjectUrl(reservation.id, conjuntoId)
      .then((url) => {
        objectUrl = url;

        // Si el modal se cerró mientras se descargaba, la URL se revoca aquí
        // mismo: nadie la va a mostrar y el blob quedaría en memoria.
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }

        setQrUrl(url);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [reservation.id, conjuntoId]);

  const people = reservation.adultsCount + reservation.minorsCount;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-100 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <Title size="sm" font="bold">
          {reservation.activityName}
        </Title>

        <Text size="sm" className="mt-1 text-gray-600">
          {formatDate(reservation.reservation_date)}
        </Text>

        {reservation.status === "USED" ? (
          <div className="mt-4 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
            Ya registraste tu entrada
            {reservation.checkedInAt
              ? ` el ${formatDate(reservation.checkedInAt)}`
              : ""}
            . Este código ya no sirve para ingresar de nuevo.
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-center">
            {error && (
              <div className="w-full rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {!error && !qrUrl && (
              <div className="h-[280px] w-[280px] animate-pulse rounded-xl bg-slate-100" />
            )}

            {qrUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={qrUrl}
                alt={`Código QR de la reserva de ${reservation.activityName}`}
                className="h-[280px] w-[280px] rounded-xl"
              />
            )}

            {reservation.code && (
              <p className="mt-3 font-mono text-xs tracking-widest text-gray-500">
                {reservation.code}
              </p>
            )}
          </div>
        )}

        <dl className="mt-5 space-y-2 border-t border-gray-100 pt-4 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">Asistentes</dt>
            <dd className="font-medium text-gray-800">
              {people} ({reservation.adultsCount} adulto(s)
              {reservation.minorsCount > 0
                ? `, ${reservation.minorsCount} menor(es)`
                : ""}
              )
            </dd>
          </div>

          {reservation.apartment && (
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Apartamento</dt>
              <dd className="font-medium text-gray-800">
                {reservation.apartment}
              </dd>
            </div>
          )}

          {reservation.inChargue && (
            <div className="flex justify-between gap-4">
              <dt className="text-gray-500">Encargado</dt>
              <dd className="font-medium text-gray-800">
                {reservation.inChargue}
              </dd>
            </div>
          )}

          {reservation.description && (
            <div>
              <dt className="text-gray-500">Tus sugerencias</dt>
              <dd className="mt-1 text-gray-800">{reservation.description}</dd>
            </div>
          )}
        </dl>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 transition"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
