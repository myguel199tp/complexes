/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { usePqrEvidence } from "@/app/hooks/usePqrEvidence";

/**
 * Miniatura de la imagen de prueba de una PQR; al hacer clic se abre completa.
 *
 * La usan la tabla de la administración, las tarjetas del residente y las del
 * colaborador encargado: el backend deja ver la foto a los tres. Va en su
 * propio componente porque el hook no puede llamarse dentro del `map` que arma
 * las filas o las tarjetas.
 *
 * Los colores son de claro sobre blanco: todas esas superficies son `bg-white`
 * en los dos temas.
 */
export function PqrEvidence({
  pqrId,
  hasEvidence,
  imgClassName = "w-14 h-14",
}: {
  pqrId: string;
  hasEvidence: boolean;
  /** Tamaño de la miniatura. */
  imgClassName?: string;
}) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const { url, failed } = usePqrEvidence(pqrId, conjuntoId, hasEvidence);

  if (!hasEvidence) {
    return <span className="text-xs text-gray-500">Sin imagen</span>;
  }

  if (failed) {
    return <span className="text-xs text-red-600">No se pudo cargar</span>;
  }

  if (!url) {
    return <span className="text-xs text-gray-500">Cargando…</span>;
  }

  return (
    <button
      type="button"
      onClick={() => window.open(url, "_blank")}
      title="Ver imagen completa"
      className="block w-fit"
    >
      <img
        src={url}
        alt="Imagen de prueba"
        className={`${imgClassName} object-cover rounded-md border border-gray-200 hover:opacity-80 transition-opacity`}
      />
    </button>
  );
}

/**
 * Bloque "Imagen de prueba" para las tarjetas. No pinta nada si la petición no
 * trae foto: en una tarjeta un "Sin imagen" solo ocupa espacio.
 */
export function PqrEvidenceBlock({
  pqrId,
  evidence,
  className = "",
}: {
  pqrId: string;
  evidence?: string | null;
  className?: string;
}) {
  if (!evidence) return null;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="text-xs font-semibold text-gray-600">
        Imagen de prueba
      </span>
      <PqrEvidence pqrId={pqrId} hasEvidence imgClassName="w-24 h-24" />
    </div>
  );
}
