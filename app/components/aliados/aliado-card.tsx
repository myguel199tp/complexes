/* eslint-disable @next/next/no-img-element */
"use client";

import { Text } from "complexes-next-components";
import { IoStar, IoStarHalf, IoStarOutline } from "react-icons/io5";
import { AliadoB2b, resolveAliadoLogo } from "./aliados-service";

interface Props {
  aliado: AliadoB2b;
}

export function AliadoCard({ aliado }: Props) {
  const logo = resolveAliadoLogo(aliado.logoUrl);
  const ubicacion = [aliado.city, aliado.country].filter(Boolean).join(", ");

  return (
    <article className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-600 hover:shadow-lg">
      <div className="relative flex h-28 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50">
        {logo ? (
          <img
            src={logo}
            alt={aliado.businessName}
            className="max-h-24 max-w-full object-contain"
          />
        ) : (
          <span className="text-4xl font-bold text-cyan-800">
            {aliado.businessName?.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="absolute right-2 top-2 rounded-full bg-cyan-800 px-2 py-0.5 text-[10px] font-semibold text-white">
          Aliado B2B
        </span>
      </div>

      <div className="mt-3 flex-1">
        <Text font="bold" size="sm">
          {aliado.businessName}
        </Text>

        <Rating value={aliado.ratingAverage} count={aliado.ratingCount} />

        {ubicacion ? (
          <Text size="xs" className="mt-0.5 text-gray-500">
            {ubicacion}
          </Text>
        ) : null}

        {aliado.description ? (
          <Text size="sm" className="mt-2 line-clamp-3 text-gray-600">
            {aliado.description}
          </Text>
        ) : null}
      </div>
    </article>
  );
}

/** Estrellas de solo lectura sobre fondo claro. */
function Rating({
  value,
  count,
}: {
  value?: number | null;
  count?: number;
}) {
  if (value === null || value === undefined) {
    return (
      <span className="mt-1 inline-flex items-center gap-1 text-xs text-gray-400">
        <IoStarOutline size={13} />
        Sin calificaciones aún
      </span>
    );
  }

  return (
    <span className="mt-1 inline-flex items-center gap-1">
      <span className="inline-flex text-amber-500" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => {
          if (value >= i) return <IoStar key={i} size={13} />;
          if (value >= i - 0.5) return <IoStarHalf key={i} size={13} />;
          return <IoStarOutline key={i} size={13} className="text-gray-300" />;
        })}
      </span>

      <span className="text-xs text-gray-500">
        {value.toFixed(1)}
        {typeof count === "number" ? ` (${count})` : ""}
      </span>

      <span className="sr-only">
        {value.toFixed(1)} de 5 estrellas
        {typeof count === "number" ? `, ${count} calificaciones` : ""}
      </span>
    </span>
  );
}

/** Placeholder con la misma silueta de la tarjeta, para evitar saltos de layout. */
export function AliadoCardSkeleton() {
  return (
    <div className="flex h-full animate-pulse flex-col rounded-2xl border border-gray-200 bg-white p-4">
      <div className="h-28 rounded-xl bg-gray-100" />
      <div className="mt-4 h-3 w-2/3 rounded bg-gray-100" />
      <div className="mt-2 h-3 w-1/3 rounded bg-gray-100" />
      <div className="mt-4 h-2 w-full rounded bg-gray-100" />
      <div className="mt-2 h-2 w-5/6 rounded bg-gray-100" />
    </div>
  );
}
