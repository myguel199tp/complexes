/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Title, Text } from "complexes-next-components";
import { route } from "@/app/_domain/constants/routes";
import { ImSpinner9 } from "react-icons/im";
import { useMyBookings } from "./useBookings";
import { useCreateReview, useCancelBooking } from "./useBookingActions";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { formatCurrency } from "@/app/_helpers/format-currency";
import MessageNotData from "@/app/components/messageNotData";
import { fileUrl } from "@/app/helpers/fileUrl";

const formatDate = (dateStr?: string | null): string =>
  dateStr ? new Date(dateStr).toLocaleDateString("es-CO") : "-";

const resolveImage = (image?: string): string => {
  if (!image) return "";
  if (/^https?:\/\//.test(image)) return image;
  return fileUrl(image);
};

const estadoStyles: Record<string, string> = {
  confirmed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
};

const estadoLabel: Record<string, string> = {
  confirmed: "Confirmada",
  pending: "Pendiente",
  cancelled: "Cancelada",
};

export default function Myreservs(): React.JSX.Element {
  const router = useRouter();
  const { data: bookings = [], isLoading, error } = useMyBookings();
  const userId = useConjuntoStore((state) => state.userId);

  const createReview = useCreateReview();
  const cancelBooking = useCancelBooking();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [loadingReservation, setLoadingReservation] = useState<boolean>(false);

  const handleNewReservation = (): void => {
    setLoadingReservation(true);
    router.push(route.holiday);
  };

  const toggleDetails = (id: string): void => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleSaveReview = (hollidayId?: string): void => {
    if (!hollidayId) return;
    if (!rating) {
      alert("Selecciona una calificación");
      return;
    }
    if (!userId) {
      alert("Debes iniciar sesión para reseñar");
      return;
    }

    createReview.mutate(
      { rating, comment, hollidayId, userId: String(userId) },
      {
        onSuccess: () => {
          alert("¡Gracias por tu reseña!");
          setRating(0);
          setComment("");
          setExpandedId(null);
        },
        onError: (e) =>
          alert(e instanceof Error ? e.message : "Error al guardar la reseña"),
      },
    );
  };

  const handleCancel = (bookingId: string): void => {
    if (!confirm("¿Seguro que deseas cancelar esta reserva?")) return;

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

                  <button
                    onClick={() => toggleDetails(reservation.bookingId)}
                    className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 rounded-lg"
                  >
                    {isExpanded ? "Cerrar detalles" : "Ver detalles"}
                  </button>

                  {reservation.estado !== "cancelled" && (
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

                      <div>
                        <Text size="sm" className="font-medium text-gray-700 mb-1">
                          Califica tu estadía
                        </Text>

                        <div className="flex gap-2 text-xl cursor-pointer">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              onClick={() => setRating(star)}
                              className={
                                star <= rating
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Escribe tu comentario sobre el lugar..."
                          className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <button
                        onClick={() =>
                          handleSaveReview(reservation.inmueble?.id)
                        }
                        disabled={createReview.isPending}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm disabled:opacity-50"
                      >
                        {createReview.isPending
                          ? "Guardando..."
                          : "Guardar reseña"}
                      </button>
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
