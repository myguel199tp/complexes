"use client";

import React, { useState } from "react";
import { Text } from "complexes-next-components";
import StarRating from "@/app/components/ui/star-rating";
import { BookingReviewState } from "../service/response/BookingResponse";
import { useCreateReview } from "./useBookingActions";

const formatDay = (day?: string | null): string =>
  day ? new Date(`${day}T12:00:00`).toLocaleDateString("es-CO") : "-";

interface Props {
  bookingId: string;
  resena: BookingReviewState;
}

/**
 * Calificación de una estadía terminada, dentro de la tarjeta blanca de la
 * reserva. Cada tarjeta lleva su propio estado: antes las estrellas eran una
 * sola para toda la lista y marcar una reserva marcaba todas.
 */
export default function StayReview({ bookingId, resena }: Props) {
  const createReview = useCreateReview();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!rating) {
      setError("Selecciona una calificación");
      return;
    }

    setError(null);
    createReview.mutate(
      { bookingId, rating, comment: comment.trim() || undefined },
      {
        onError: (e) =>
          setError(e instanceof Error ? e.message : "Error al guardar la reseña"),
      },
    );
  };

  return (
    <div className="mt-3 space-y-3 rounded-lg border border-amber-200 bg-amber-50/60 p-3">
      {resena.mia ? (
        <div>
          <Text size="sm" className="font-medium text-gray-700">
            Tu calificación
          </Text>
          <StarRating value={resena.mia.rating} size="sm" />
          {resena.mia.comment && (
            <Text size="xs" className="mt-1 text-gray-600">
              “{resena.mia.comment}”
            </Text>
          )}
          <Text size="xs" className="mt-1 text-gray-500">
            {resena.mia.publicada
              ? "Ya es pública en la ficha del lugar."
              : `Se publica cuando el anfitrión te califique o, a más tardar, después del ${formatDay(resena.venceEl)}.`}
          </Text>
        </div>
      ) : resena.puedeCalificar ? (
        <div className="space-y-2">
          <Text size="sm" className="font-medium text-gray-700">
            ¿Cómo te fue en tu estadía?
          </Text>
          <StarRating value={rating} onChange={setRating} />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            placeholder="Cuéntale a otros viajeros cómo fue el lugar (opcional)"
            className="ui-native w-full"
          />
          {error && (
            <Text size="xs" className="text-red-600">
              {error}
            </Text>
          )}
          <button
            onClick={handleSave}
            disabled={createReview.isPending}
            className="w-full rounded-lg bg-green-600 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
          >
            {createReview.isPending ? "Guardando..." : "Enviar calificación"}
          </button>
          <Text size="xs" className="text-gray-500">
            Tienes hasta el {formatDay(resena.venceEl)}. El anfitrión no verá tu
            nota hasta que también te califique.
          </Text>
        </div>
      ) : (
        <Text size="xs" className="text-gray-500">
          El plazo para calificar esta estadía venció el{" "}
          {formatDay(resena.venceEl)}.
        </Text>
      )}

      {resena.delAnfitrion && (
        <div className="border-t border-amber-200 pt-2">
          <Text size="sm" className="font-medium text-gray-700">
            Lo que dijo el anfitrión de ti
          </Text>
          <StarRating value={resena.delAnfitrion.rating} size="sm" />
          {resena.delAnfitrion.comment && (
            <Text size="xs" className="mt-1 text-gray-600">
              “{resena.delAnfitrion.comment}”
            </Text>
          )}
        </div>
      )}
    </div>
  );
}
