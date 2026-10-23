"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

/**
 * Foto de prueba que el residente adjuntó a la PQR.
 *
 * Vive en la raíz privada del backend y sale por
 * `GET /pericionesqr/register-qr/:id/evidence`, que comprueba que quien
 * pregunta sea la administración, el autor o el encargado. Como un `<img>` no
 * puede mandar cabeceras, se descarga el binario y se expone como object URL.
 *
 * Es el mismo patrón que `useVisitFile` y `useFeeProof`.
 */
export function usePqrEvidence(
  pqrId: string | undefined,
  conjuntoId: string | undefined,
  enabled = true,
) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);

    if (!enabled || !pqrId || !conjuntoId) {
      setUrl(null);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    void (async () => {
      try {
        const response = await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/pericionesqr/register-qr/${pqrId}/evidence`,
          { headers: { "x-conjunto-id": conjuntoId } },
        );

        if (!response.ok) {
          if (!cancelled) setFailed(true);
          return;
        }

        const blob = await response.blob();

        if (cancelled) return;

        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      } catch {
        if (!cancelled) {
          setUrl(null);
          setFailed(true);
        }
      }
    })();

    return () => {
      cancelled = true;
      // Sin esto el blob queda retenido mientras viva la pestaña.
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [pqrId, conjuntoId, enabled]);

  return { url, failed };
}
