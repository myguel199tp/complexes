/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";
import { useVisitFile } from "../../hooks/useVisitFile";

/**
 * El comprobante ya no se sirve desde una URL pública adivinable; se descarga
 * autenticado. Va en su propio componente porque el hook no puede llamarse
 * dentro del `map` que arma las filas.
 */
export function VisitProofCell({
  visitId,
  conjuntoId,
  hasProof,
}: {
  visitId: string;
  conjuntoId: string | undefined;
  hasProof: boolean;
}) {
  const url = useVisitFile(visitId, "proof", conjuntoId, hasProof);

  if (!hasProof) return <span>Sin comprobante</span>;
  if (!url) return <span>Cargando…</span>;

  return (
    <img
      src={url}
      alt="comprobante"
      style={{ width: 60, cursor: "pointer", borderRadius: 6 }}
      onClick={() => window.open(url, "_blank")}
    />
  );
}
