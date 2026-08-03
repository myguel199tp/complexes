"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export type VisitFileKind = "document" | "photo" | "proof" | "attachment";

/**
 * Los adjuntos de portería —foto del visitante, foto de la cédula, comprobante
 * de pago— se pintaban con `<img src={`${API_URL}/${visit.paymentProof}`}>`,
 * apuntando al directorio estático público del backend: cualquiera con la URL
 * bajaba el documento de identidad de un visitante sin estar autenticado.
 *
 * Ahora se piden por `GET /visit/:id/file/:kind`, que verifica quién pregunta.
 * Como un `<img>` no puede mandar cabeceras, se descarga el binario y se expone
 * como object URL.
 */
export function useVisitFile(
  visitId: string | undefined,
  kind: VisitFileKind,
  conjuntoId: string | undefined,
  enabled = true,
) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !visitId || !conjuntoId) {
      setUrl(null);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    void (async () => {
      try {
        const response = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/visit/${visitId}/file/${kind}`,
          { headers: { "x-conjunto-id": conjuntoId } },
        );

        if (!response.ok) return;

        const blob = await response.blob();

        if (cancelled) return;

        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      } catch {
        if (!cancelled) setUrl(null);
      }
    })();

    return () => {
      cancelled = true;
      // Sin esto el blob queda retenido en memoria mientras viva la pestaña.
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [visitId, kind, conjuntoId, enabled]);

  return url;
}
