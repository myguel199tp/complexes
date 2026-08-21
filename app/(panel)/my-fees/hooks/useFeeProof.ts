"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

/**
 * Comprobante de pago de una cuota.
 *
 * Se pintaba con un enlace directo a `${API_URL}/uploads/payments/…`, el
 * directorio estático del backend: cualquiera con la URL —o probando fechas
 * alrededor del nombre del archivo, que era `<original>-<timestamp>.<ext>`— se
 * bajaba la consignación de otro residente, con su banco, su monto y su número
 * de cuenta, sin estar autenticado.
 *
 * Ahora se pide por `GET /admin-fee/:id/proof`, que valida que quien pregunta
 * sea el dueño de la cuota o el personal del conjunto. Como un `<a href>` no
 * puede mandar cabeceras, se descarga el binario y se expone como object URL.
 *
 * Es el mismo patrón que `useVisitFile` en el módulo de portería.
 */
export function useFeeProof(
  feeId: string | undefined,
  conjuntoId: string | undefined,
  enabled = true,
) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !feeId || !conjuntoId) {
      setUrl(null);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    void (async () => {
      try {
        const response = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin-fee/${feeId}/proof`,
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
      // Sin esto el blob queda retenido mientras viva la pestaña.
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [feeId, conjuntoId, enabled]);

  return url;
}
