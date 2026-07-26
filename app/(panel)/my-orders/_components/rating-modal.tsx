"use client";

import React, { useState } from "react";
import { Modal, Text, Title, Button } from "complexes-next-components";
import { FiStar } from "react-icons/fi";
import { useRatingMutation } from "./use-marketplace-queries";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Qué se está calificando: un pedido entregado o una cita prestada. */
  target: { id: string; kind: "order" | "booking"; sellerLabel: string } | null;
}

/**
 * Calificación de 1 a 5 estrellas.
 *
 * Solo se abre desde un pedido entregado o una cita prestada: el backend
 * rechaza cualquier otra cosa, y esa es justamente la garantía de que las
 * estrellas respaldan transacciones reales.
 */
export default function RatingModal({ isOpen, onClose, target }: Props) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");

  const mutation = useRatingMutation();

  if (!target) return null;

  const handleSubmit = () => {
    if (rating < 1) return;

    mutation.mutate(
      {
        id: target.id,
        kind: target.kind,
        body: { rating, comment: comment.trim() || undefined },
      },
      {
        onSuccess: () => {
          setRating(0);
          setComment("");
          onClose();
        },
      },
    );
  };

  const shown = hovered || rating;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      className="!w-[94%] md:!w-[460px] !rounded-3xl"
    >
      <div className="p-6 space-y-5">
        <div>
          <Title className="text-xl font-bold">¿Cómo te fue?</Title>
          <Text size="sm" className="text-gray-500 mt-1">
            {target.sellerLabel}
          </Text>
        </div>

        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              onMouseEnter={() => setHovered(value)}
              onMouseLeave={() => setHovered(0)}
              className="transition-transform hover:scale-110"
              aria-label={`${value} estrellas`}
            >
              <FiStar
                size={34}
                className={
                  value <= shown
                    ? "fill-amber-400 text-amber-400"
                    : "text-gray-300"
                }
              />
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Cuéntale a tus vecinos cómo te fue (opcional)"
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-cyan-500"
        />

        <div className="flex gap-3">
          <Button colVariant="default" className="flex-1" onClick={onClose}>
            Ahora no
          </Button>

          <Button
            colVariant="success"
            className="flex-1"
            disabled={rating < 1 || mutation.isPending}
            onClick={handleSubmit}
          >
            {mutation.isPending ? "Enviando..." : "Enviar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
