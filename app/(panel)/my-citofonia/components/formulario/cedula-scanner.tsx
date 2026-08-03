"use client";

import React, { useEffect, useRef, useState } from "react";
// Solo el tipo: el import real es dinámico dentro del efecto (toca `window`).
import type { Html5Qrcode } from "html5-qrcode";
import { Button, Text } from "complexes-next-components";
import {
  CedulaData,
  parseCedulaPdf417,
} from "@/app/helpers/cedula-pdf417";

/**
 * Lee el PDF417 del reverso de la cédula y llena nombre y documento.
 *
 * El portero transcribía los dos campos a mano en cada visita —unos 40 segundos
 * por persona y con erratas en lo que después es una bitácora de seguridad—.
 *
 * `html5-qrcode` ya estaba en el proyecto para el QR de domicilios; solo hay que
 * pedirle el formato PDF417, que no trae activo por defecto.
 */
export function CedulaScanner({
  onRead,
}: {
  onRead: (data: CedulaData) => void;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    void (async () => {
      // Import dinámico: la librería toca `window` al cargarse y este árbol se
      // renderiza también en el servidor.
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import(
        "html5-qrcode"
      );

      if (cancelled) return;

      const scanner = new Html5Qrcode("cedula-reader", {
        formatsToSupport: [Html5QrcodeSupportedFormats.PDF_417],
        verbose: false,
      });

      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },
          // El PDF417 es ancho y bajo: un recuadro cuadrado obliga a alejar el
          // documento hasta que deja de resolverse.
          { fps: 10, qrbox: { width: 320, height: 120 } },
          (decoded) => {
            const parsed = parseCedulaPdf417(decoded);

            if (!parsed) {
              setMessage(
                "No se pudo leer la cédula. Escribe los datos a mano.",
              );
              return;
            }

            onRead(parsed);
            setMessage(null);
            setOpen(false);
          },
          () => {},
        );
      } catch {
        if (!cancelled) {
          setMessage("No se pudo abrir la cámara.");
          setOpen(false);
        }
      }
    })();

    return () => {
      cancelled = true;

      const scanner = scannerRef.current;
      scannerRef.current = null;

      // `stop()` falla si el escáner nunca llegó a arrancar; da igual.
      scanner?.stop().then(() => scanner.clear()).catch(() => {});
    };
  }, [open, onRead]);

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" onClick={() => setOpen((value) => !value)}>
        {open ? "Cerrar lector" : "Escanear cédula"}
      </Button>

      {open && <div id="cedula-reader" className="w-full" />}

      {message && (
        <Text size="xs" className="text-amber-600">
          {message}
        </Text>
      )}
    </div>
  );
}
