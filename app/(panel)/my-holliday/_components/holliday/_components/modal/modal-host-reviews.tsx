"use client";

import { Modal, Text } from "complexes-next-components";
import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImSpinner9 } from "react-icons/im";
import StarRating from "@/app/components/ui/star-rating";
import {
  HostReview,
  hostReviewsService,
  replyReviewService,
} from "../../../../services/hostReviewsService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  hollidayId: string;
}

/** Reseñas públicas del inmueble, con respuesta del anfitrión. */
export default function ModalHostReviews({ isOpen, onClose, hollidayId }: Props) {
  const { data: reviews = [], isLoading, error } = useQuery<HostReview[]>({
    queryKey: ["host-reviews", hollidayId],
    queryFn: () => hostReviewsService(hollidayId),
    enabled: isOpen && !!hollidayId,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reseñas del inmueble"
      className="!w-[94%] md:!w-[560px] max-w-[96vw]"
    >
      {isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <ImSpinner9 className="animate-spin text-cyan-800" size={36} />
        </div>
      ) : error ? (
        <Text size="sm" className="py-6 text-center text-red-500">
          No pudimos cargar las reseñas.
        </Text>
      ) : reviews.length === 0 ? (
        <Text size="sm" className="py-6 text-center text-slate-500">
          Todavía no hay reseñas públicas.
        </Text>
      ) : (
        <div className="max-h-[65vh] space-y-3 overflow-y-auto pr-1">
          {reviews.map((review) => (
            <ReviewItem key={review.id} review={review} hollidayId={hollidayId} />
          ))}
        </div>
      )}
    </Modal>
  );
}

function ReviewItem({
  review,
  hollidayId,
}: {
  review: HostReview;
  hollidayId: string;
}) {
  const queryClient = useQueryClient();
  const [text, setText] = useState(review.respuestaAnfitrion?.texto ?? "");
  const [editing, setEditing] = useState(!review.respuestaAnfitrion);
  const [error, setError] = useState<string | null>(null);

  const reply = useMutation({
    mutationFn: () => replyReviewService(review.id, text.trim()),
    onSuccess: () => {
      setEditing(false);
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["host-reviews", hollidayId] });
    },
    onError: (e) =>
      setError(e instanceof Error ? e.message : "No se pudo guardar la respuesta"),
  });

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-slate-900">
          {review.autor || "Huésped"}
        </span>
        <StarRating value={review.rating} size="sm" />
      </div>
      <p className="text-[11px] text-slate-500">
        {new Date(review.createdAt).toLocaleDateString("es-CO")}
        {review.oculta ? " · Oculta por la administración" : ""}
      </p>
      {review.comment && (
        <p className="mt-1 text-sm text-slate-700">“{review.comment}”</p>
      )}

      {!editing && review.respuestaAnfitrion ? (
        <div className="mt-2 rounded-md bg-slate-50 p-2">
          <p className="text-xs font-semibold text-slate-700">Tu respuesta</p>
          <p className="text-sm text-slate-700">
            {review.respuestaAnfitrion.texto}
          </p>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="mt-1 text-xs font-semibold text-cyan-700 underline"
          >
            Editar
          </button>
        </div>
      ) : (
        <div className="mt-2 space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={1000}
            placeholder="Responde en público: lo verán otros viajeros"
            className="ui-native w-full"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="button"
            onClick={() => reply.mutate()}
            disabled={reply.isPending || !text.trim()}
            className="w-full rounded-lg bg-cyan-700 py-1.5 text-xs font-semibold text-white hover:bg-cyan-800 disabled:opacity-50"
          >
            {reply.isPending ? "Guardando..." : "Publicar respuesta"}
          </button>
        </div>
      )}
    </div>
  );
}
