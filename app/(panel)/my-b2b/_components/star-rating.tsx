"use client";

import { IoStar, IoStarHalf, IoStarOutline } from "react-icons/io5";

const SIZES = { sm: 14, md: 18, lg: 24 } as const;

/** Estrellas de solo lectura. Muestra media estrella para promedios como 4.5. */
export function StarRating({
  value,
  count,
  size = "sm",
  showValue = true,
}: {
  value: number | null;
  count?: number;
  size?: keyof typeof SIZES;
  showValue?: boolean;
}) {
  const px = SIZES[size];

  if (value === null || value === undefined) {
    return (
      <span className="inline-flex items-center gap-1 text-slate-500 text-xs">
        <IoStarOutline size={px} />
        Sin calificaciones
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex text-amber-400" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => {
          if (value >= i) return <IoStar key={i} size={px} />;
          if (value >= i - 0.5) return <IoStarHalf key={i} size={px} />;
          return <IoStarOutline key={i} size={px} className="text-slate-600" />;
        })}
      </span>

      {showValue && (
        <span className="text-xs text-slate-300">
          {value.toFixed(1)}
          {typeof count === "number" && (
            <span className="text-slate-500"> ({count})</span>
          )}
        </span>
      )}

      <span className="sr-only">
        {value.toFixed(1)} de 5 estrellas
        {typeof count === "number" ? `, ${count} calificaciones` : ""}
      </span>
    </span>
  );
}

/** Selector de estrellas para el formulario de calificación. */
export function StarInput({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Calificación">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} ${i === 1 ? "estrella" : "estrellas"}`}
          disabled={disabled}
          onClick={() => onChange(i)}
          className="text-amber-400 transition hover:scale-110 disabled:opacity-50"
        >
          {value >= i ? <IoStar size={28} /> : <IoStarOutline size={28} className="text-slate-600" />}
        </button>
      ))}
    </div>
  );
}
