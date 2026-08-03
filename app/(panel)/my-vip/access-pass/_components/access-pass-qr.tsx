/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { Text } from "complexes-next-components";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { fetchAccessPassQr } from "@/app/(panel)/my-citofonia/services/accessPassService";

/**
 * El QR lo dibuja el backend con `qrcode`, así ninguno de los dos clientes
 * necesita su propia librería. Se descarga como blob porque la petición lleva
 * cabeceras de sesión y de conjunto que un `<img src>` no puede enviar.
 */
export function AccessPassQr({
  passId,
  code,
}: {
  passId: string;
  code: string;
}) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!conjuntoId) return;

    let cancelled = false;
    let objectUrl: string | null = null;

    void (async () => {
      try {
        const blob = await fetchAccessPassQr(conjuntoId, passId);
        if (cancelled) return;

        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [conjuntoId, passId]);

  return (
    <div className="flex flex-col items-center gap-2">
      {url && (
        <img
          src={url}
          alt={`Código de acceso ${code}`}
          className="w-48 h-48 rounded bg-white"
        />
      )}

      {failed && (
        <Text size="xs">No se pudo dibujar el QR; usa el código de abajo.</Text>
      )}

      {/* Si la cámara de la portería falla, el código se puede digitar. */}
      <Text size="xs" font="bold" className="tracking-widest">
        {code}
      </Text>
    </div>
  );
}
