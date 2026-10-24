"use client";

import React from "react";

interface Props {
  value: number;
  /** Sin `onChange` las estrellas solo muestran la nota. */
  onChange?: (value: number) => void;
  size?: "sm" | "md";
  /**
   * Color de las estrellas vacías. El valor por defecto es para fondo blanco
   * (tarjetas y modales); sobre el fondo del panel pásale su par `dark:`.
   */
  emptyClassName?: string;
}

export default function StarRating({
  value,
  onChange,
  size = "md",
  emptyClassName = "text-slate-300",
}: Props) {
  const textSize = size === "sm" ? "text-sm" : "text-2xl";

  return (
    <div
      className={`flex gap-1 ${textSize}`}
      role={onChange ? "radiogroup" : "img"}
      aria-label={`${value} de 5 estrellas`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const color = star <= value ? "text-amber-400" : emptyClassName;

        return onChange ? (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === value}
            aria-label={`${star} estrella${star === 1 ? "" : "s"}`}
            onClick={() => onChange(star)}
            className={`${color} leading-none transition hover:scale-110`}
          >
            ★
          </button>
        ) : (
          <span key={star} className={`${color} leading-none`}>
            ★
          </span>
        );
      })}
    </div>
  );
}
