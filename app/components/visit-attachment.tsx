/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { useVisitFile } from "../(panel)/my-citofonia/hooks/useVisitFile";

/**
 * Adjunto de la visita servido por el endpoint autenticado. Antes se pintaba
 * desde `/uploads`, que es estático y público.
 */
export function VisitAttachment({
  visitId,
  conjuntoId,
}: {
  visitId: string;
  conjuntoId: string | undefined;
}) {
  const url = useVisitFile(visitId, "attachment", conjuntoId);

  if (!url) {
    return <span className="text-xs text-gray-500">Cargando…</span>;
  }

  return (
    <img src={url} alt="foto" className="w-24 h-24 object-cover rounded" />
  );
}
