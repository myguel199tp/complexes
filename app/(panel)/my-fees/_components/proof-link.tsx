"use client";

import React from "react";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useFeeProof } from "../hooks/useFeeProof";

/**
 * Enlace al comprobante de una cuota.
 *
 * Existe como componente y no como una función que arma la URL porque el
 * archivo ya no se sirve por URL pública: hay que pedirlo autenticado y
 * convertirlo en object URL, y eso es un hook, que solo puede vivir dentro de
 * un componente. Las tablas pintan una fila por cuota, así que el hook tiene
 * que estar en el hijo.
 *
 * Se descarga al montar: quien abre la bandeja de verificación va a revisar los
 * soportes, así que precargarlos es lo que se quiere. Si algún día la lista
 * crece a cientos de filas, conviene pasar a descarga bajo demanda.
 */
export function ProofLink({
  feeId,
  label = "Ver soporte",
  fallback = null,
}: {
  feeId: string;
  label?: string;
  /** Qué mostrar si la cuota no tiene comprobante o no se pudo cargar. */
  fallback?: React.ReactNode;
}) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const url = useFeeProof(feeId, conjuntoId);

  if (!url) return <>{fallback}</>;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 underline"
    >
      {label}
    </a>
  );
}
