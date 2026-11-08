"use client";

import { useEffect, useState } from "react";
import { getParcelPhoto } from "../services/parcelService";

/**
 * Un `<img>` no puede mandar cabeceras y la foto sale por un endpoint con
 * sesión, así que se descarga el binario y se expone como object URL.
 */
export function useParcelPhoto(
  parcelId: string,
  conjuntoId: string | null | undefined,
  enabled: boolean,
) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !conjuntoId) {
      setUrl(null);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    getParcelPhoto(conjuntoId, parcelId)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => {
        // Sin foto la tarjeta sigue sirviendo: el resto de los datos están.
        if (!cancelled) setUrl(null);
      });

    return () => {
      cancelled = true;
      // Sin esto el blob queda retenido en memoria mientras viva la pestaña.
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [parcelId, conjuntoId, enabled]);

  return url;
}
