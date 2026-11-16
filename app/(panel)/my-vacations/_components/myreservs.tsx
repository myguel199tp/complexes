/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Title, Text } from "complexes-next-components";
import { Button } from "@/app/components/ui/form";
import { route } from "@/app/_domain/constants/routes";
import { ImSpinner9 } from "react-icons/im";
import { useMyBookings } from "./useBookings";
import { useCancelBooking, useResumeBooking } from "./useBookingActions";
import {
  CancelPreview,
  cancelPreviewService,
} from "../service/cancelBookingService";
import StayReview from "./stay-review";
import { formatCurrency } from "@/app/_helpers/format-currency";
import MessageNotData from "@/app/components/messageNotData";
import { fileUrl } from "@/app/helpers/fileUrl";
import { DamageClaimSummary } from "@/app/components/booking-damage-claim";
import { MyBookingResponse } from "../service/response/BookingResponse";
import { useRespondDamageClaim } from "./useBookingActions";

const formatDate = (dateStr?: string | null): string =>
  dateStr ? new Date(dateStr).toLocaleDateString("es-CO") : "-";

const formatTime = (dateStr?: string | null): string =>
  dateStr
    ? new Date(dateStr).toLocaleString("es-CO", {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "-";

const resolveImage = (image?: string): string => {
  if (!image) return "";
  if (/^https?:\/\//.test(image)) return image;
  return fileUrl(image);
};

const estadoStyles: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  completed: "bg-slate-100 text-slate-700",
  no_show: "bg-orange-100 text-orange-700",
  cancelled: "bg-red-100 text-red-700",
};

const estadoLabel: Record<string, string> = {
  confirmed: "Confirmada",
  pending: "Pendiente",
  completed: "Finalizada",
  no_show: "No te presentaste",
  cancelled: "Cancelada",
};

export default function Myreservs(): React.JSX.Element {
  const router = useRouter();
  const { data: bookings = [], isLoading, error } = useMyBookings();

  const cancelBooking = useCancelBooking();
  const resumeBooking = useResumeBooking();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingReservation, setLoadingReservation] = useState<boolean>(false);

  const handleNewReservation = (): void => {
    setLoadingReservation(true);
    router.push(route.holiday);
  };

  const toggleDetails = (id: string): void => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  /**
   * Antes de cancelar, el huésped ve cuánto le devuelven según la política
   * del inmueble: es lo que decide si cancela o no.
   */
  const handleCancel = async (bookingId: string): Promise<void> => {
    let preview: CancelPreview;
    try {
      preview = await cancelPreviewService(bookingId);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al consultar la cancelación");
      return;
    }

    if (!preview.puedeCancelar) {
      alert(preview.motivo ?? "Esta reserva ya no se puede cancelar");
      return;
    }

    if (!confirm(`${preview.mensaje}\n\n¿Seguro que deseas cancelar esta reserva?`)) {
      return;
    }

    cancelBooking.mutate(bookingId, {
      onSuccess: () => alert("Reserva cancelada"),
      onError: (e) =>
        alert(e instanceof Error ? e.message : "Error al cancelar"),
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <Title size="sm" font="bold" colVariant="on">
            {" "}
            Mis Reservas
          </Title>
          <Text size="sm" className="text-gray-500">
            Aquí puedes ver los lugares donde has reservado o viajado.
          </Text>
        </div>

        <Button
          onClick={handleNewReservation}
          colVariant="success"
          disabled={loadingReservation}
        >
          {loadingReservation ? <ImSpinner9 /> : "Quiero reservar"}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-60">
          <ImSpinner9 className="animate-spin text-cyan-800" size={40} />
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">
          No pudimos cargar tus reservas. Intenta de nuevo.
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <MessageNotData />
          <Text size="sm" className="text-gray-500 my-4">Aún no tienes reservas.</Text>

          <button
            onClick={handleNewReservation}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
          >
            Buscar lugares
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((reservation) => {
            const isExpanded = expandedId === reservation.bookingId;
            const img = resolveImage(reservation.inmueble?.imagen);

            return (
              <div
                key={reservation.bookingId}
                className="bg-white rounded-xl shadow-sm border hover:shadow-md transition overflow-hidden"
              >
                {img ? (
                  <img
                    src={img}
                    alt={reservation.inmueble?.nombre}
                    className="w-full h-40 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                    Sin imagen
                  </div>
                )}

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <Text as="h2" font="semi" className="text-lg text-gray-800">
                      {reservation.inmueble?.nombre || "Reserva"}
                    </Text>
                    <span
                      className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                        estadoStyles[reservation.estado] ??
                        "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {estadoLabel[reservation.estado] ?? reservation.estado}
                    </span>
                  </div>

                  <Text size="sm" className="text-gray-500">
                    {[reservation.inmueble?.ciudad, reservation.inmueble?.pais]
                      .filter(Boolean)
                      .join(", ")}
                  </Text>

                  <Text size="xs" className="text-gray-400 mt-2">
                    {formatDate(reservation.fechas?.entrada)} →{" "}
                    {formatDate(reservation.fechas?.salida)}
                    {reservation.noches ? ` · ${reservation.noches} noches` : ""}
                  </Text>

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {reservation.pasajeros ?? 0} pasajeros
                    </span>
                    <span className="text-sm font-semibold text-gray-800">
                      {formatCurrency(reservation.totalPagado || 0)}
                    </span>
                  </div>

                  {reservation.estado === "confirmed" &&
                    reservation.codigoAcceso && (
                      <div className="mt-3 rounded-lg border border-cyan-200 bg-cyan-50 p-3 text-center">
                        <Text size="xs" className="text-cyan-700 mb-1">
                          Código de acceso (muéstralo en portería)
                        </Text>
                        <Text font="bold" className="text-lg tracking-widest text-cyan-800">
                          {reservation.codigoAcceso}
                        </Text>
                      </div>
                    )}

                  {reservation.estado === "confirmed" &&
                    reservation.accesoConjunto && (
                      <div
                        className={`mt-3 rounded-lg border p-3 ${
                          reservation.accesoConjunto.vigente
                            ? "border-emerald-200 bg-emerald-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <Text size="sm"
                            className={`text-xs font-medium ${
                              reservation.accesoConjunto.vigente
                                ? "text-emerald-700"
                                : "text-gray-500"
                            }`}
                          >
                            Visitante registrado en el conjunto
                          </Text>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap ${
                              reservation.accesoConjunto.vigente
                                ? "bg-emerald-200 text-emerald-800"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {reservation.accesoConjunto.vigente
                              ? "Vigente"
                              : "Finalizado"}
                          </span>
                        </div>

                        <Text size="xs" className="mt-1 text-gray-500">
                          {formatDate(reservation.accesoConjunto.desde)} →{" "}
                          {formatDate(reservation.accesoConjunto.hasta)}
                        </Text>
                      </div>
                    )}

                  {reservation.estado === "pending" &&
                    reservation.completarAntesDe && (
                      <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                        <Text size="xs" className="text-yellow-800">
                          Esta reserva no está confirmada. Complétala antes del{" "}
                          {formatTime(reservation.completarAntesDe)} o las
                          noches se liberan.
                        </Text>
                        <button
                          onClick={() =>
                            resumeBooking.mutate(reservation.bookingId, {
                              onError: (e) =>
                                alert(
                                  e instanceof Error
                                    ? e.message
                                    : "No se pudo retomar la reserva",
                                ),
                            })
                          }
                          disabled={resumeBooking.isPending}
                          className="mt-2 w-full rounded-lg bg-green-600 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          {resumeBooking.isPending
                            ? "Abriendo..."
                            : "Completar reserva"}
                        </button>
                      </div>
                    )}

                  {reservation.estado === "completed" && reservation.resena && (
                    <StayReview
                      bookingId={reservation.bookingId}
                      resena={reservation.resena}
                    />
                  )}

                  <button
                    onClick={() => toggleDetails(reservation.bookingId)}
                    className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 rounded-lg"
                  >
                    {isExpanded ? "Cerrar detalles" : "Ver detalles"}
                  </button>

                  {reservation.devolucion && (
                    <RefundNote devolucion={reservation.devolucion} />
                  )}

                  {reservation.proteccionDanos && (
                    <Text size="xs" className="mt-2 text-gray-500">
                      Protección de daños:{" "}
                      {formatCurrency(reservation.proteccionDanos.tarifa)}, cubre
                      hasta {formatCurrency(reservation.proteccionDanos.cobertura)}.
                    </Text>
                  )}

                  {reservation.reclamo && (
                    <DamageClaimSummary
                      bookingId={reservation.bookingId}
                      claim={reservation.reclamo}
                      audience="guest"
                      covered={!!reservation.proteccionDanos}
                    />
                  )}

                  {reservation.reclamo && reservation.puedeResponderReclamo && (
                    <ClaimResponseForm
                      bookingId={reservation.bookingId}
                      current={reservation.reclamo.respuestaHuesped}
                    />
                  )}

                  {reservation.politicaCancelacion &&
                    (reservation.estado === "pending" ||
                      reservation.estado === "confirmed") && (
                      <Text
                        size="xs"
                        className="mt-2 text-gray-500"
                        title={reservation.politicaCancelacion.descripcion}
                      >
                        Cancelación {reservation.politicaCancelacion.nombre.toLowerCase()}:{" "}
                        {reservation.politicaCancelacion.descripcion}
                      </Text>
                    )}

                  {/* Hasta el día de llegada; el backend dice cuánto se devuelve. */}
                  {reservation.puedeCancelar && (
                    <button
                      onClick={() => handleCancel(reservation.bookingId)}
                      disabled={cancelBooking.isPending}
                      className="mt-2 w-full bg-red-50 hover:bg-red-100 text-red-600 text-sm py-2 rounded-lg disabled:opacity-50"
                    >
                      {cancelBooking.isPending
                        ? "Cancelando..."
                        : "Cancelar reserva"}
                    </button>
                  )}

                  {isExpanded && (
                    <div className="mt-4 border-t pt-4 space-y-3">
                      <div className="text-xs text-gray-500 space-y-1">
                        {reservation.inmueble?.torre && (
                          <Text size="sm">Torre: {reservation.inmueble.torre}</Text>
                        )}
                        {reservation.inmueble?.apartamento && (
                          <Text size="sm">Apartamento: {reservation.inmueble.apartamento}</Text>
                        )}
                        {reservation.inmueble?.unidad && (
                          <Text size="sm">Unidad: {reservation.inmueble.unidad}</Text>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Lo que la plataforma te devuelve y en qué va: el depósito en revisión
 * mientras el anfitrión recibe el inmueble, pendiente de transferir o ya
 * transferido.
 */
function RefundNote({
  devolucion,
}: {
  devolucion: NonNullable<MyBookingResponse["devolucion"]>;
}) {
  const what =
    devolucion.concepto === "reembolso" ? "Reembolso" : "Depósito a devolver";

  if (devolucion.estado === "en_revision") {
    return (
      <Text size="xs" className="mt-2 text-amber-700">
        Depósito de {formatCurrency(devolucion.monto)} en revisión: el
        anfitrión tiene hasta el {formatTime(devolucion.revisionHasta)} para
        reportar daños. Si no reporta nada, se te devuelve completo.
      </Text>
    );
  }

  return (
    <div className="mt-2">
      <Text size="xs" className="text-emerald-700">
        {what}: {formatCurrency(devolucion.monto)}
        {devolucion.estado === "devuelto"
          ? ` · transferido el ${formatDate(devolucion.devueltoEl)}`
          : " · la plataforma te lo transferirá"}
      </Text>
      {(devolucion.retenido ?? 0) > 0 && (
        <Text size="xs" className="text-gray-500">
          Se retuvieron {formatCurrency(devolucion.retenido ?? 0)} del depósito
          por daños.
        </Text>
      )}
    </div>
  );
}

const MIN_RESPONSE = 10;

/** Tu versión de los daños, mientras la plataforma no haya decidido. */
function ClaimResponseForm({
  bookingId,
  current,
}: {
  bookingId: string;
  current: string | null;
}) {
  const respond = useRespondDamageClaim();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(current ?? "");
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setText(current ?? "");
          setError(null);
          setOpen(true);
        }}
        className="mt-2 w-full rounded-lg bg-amber-50 py-2 text-sm text-amber-800 hover:bg-amber-100"
      >
        {current ? "Corregir mi versión" : "Dar mi versión"}
      </button>
    );
  }

  const submit = () => {
    if (text.trim().length < MIN_RESPONSE) {
      setError(`Escribe al menos ${MIN_RESPONSE} caracteres.`);
      return;
    }
    setError(null);
    respond.mutate(
      { bookingId, response: text.trim() },
      {
        onSuccess: () => setOpen(false),
        onError: (e) =>
          setError(e instanceof Error ? e.message : "No se pudo enviar tu versión"),
      },
    );
  };

  return (
    <div className="mt-2 space-y-2">
      <textarea
        rows={3}
        maxLength={2000}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Cuéntale a la plataforma qué pasó: si el daño ya estaba, si fue un accidente…"
        className="w-full min-w-0 rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm text-gray-900"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={respond.isPending}
          className="flex-1 rounded-lg bg-gray-100 py-2 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50"
        >
          Volver
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={respond.isPending}
          className="flex-1 rounded-lg bg-amber-600 py-2 text-sm text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {respond.isPending ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </div>
  );
}
