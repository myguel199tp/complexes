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
/**
 * El `BarcodeDetector` nativo lee PDF417 mucho mejor que el zxing-js que trae
 * html5-qrcode, pero no se puede activar a ciegas: la librería lo prueba con
 * `new BarcodeDetector(...)` sin try/catch, y en los Android donde el módulo de
 * Play Services no está instalado eso lanza dentro del constructor y tumba la
 * página. `getSupportedFormats()` responde sin construir nada.
 */
async function supportsNativePdf417(): Promise<boolean> {
  const detector = (
    window as unknown as {
      BarcodeDetector?: { getSupportedFormats?: () => Promise<string[]> };
    }
  ).BarcodeDetector;

  if (!detector?.getSupportedFormats) return false;

  try {
    return (await detector.getSupportedFormats()).includes("pdf417");
  } catch {
    return false;
  }
}

/**
 * `stop()` hace un `throw` **síncrono** ("Cannot stop, scanner is not running or
 * paused") cuando el escáner todavía no arrancó, así que encadenar `.catch()` no
 * basta. Y si ese throw sale del cleanup de un `useEffect`, React lo sube al
 * error boundary y tumba la página entera.
 */
function stopSafely(scanner: Html5Qrcode) {
  try {
    void scanner
      .stop()
      .then(() => scanner.clear())
      .catch(() => {});
  } catch {
    // Nunca llegó a arrancar: no hay cámara que soltar.
  }
}

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

      const useNative = await supportsNativePdf417();

      if (cancelled) return;

      // Todo dentro del try: el constructor también puede lanzar, y una promesa
      // rechazada aquí se convierte en pantalla de error de Next, no en un aviso.
      try {
        const scanner = new Html5Qrcode("cedula-reader", {
          formatsToSupport: [Html5QrcodeSupportedFormats.PDF_417],
          experimentalFeatures: { useBarCodeDetectorIfSupported: useNative },
          verbose: false,
        });

        scannerRef.current = scanner;

        await scanner.start(
          // Resolución alta a propósito: un PDF417 de cédula mete cientos de
          // barras en ~5 cm y a 640x480 (el default de getUserMedia) cada barra
          // no llega a un píxel, así que nunca decodifica.
          {
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          // Sin `qrbox`: recorta el frame a esa caja y descarta justo los
          // píxeles que hacen falta para resolver las barras.
          { fps: 10, disableFlip: true },
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

        // El cleanup pudo correr mientras `start()` estaba en vuelo: entonces su
        // `stop()` no hizo nada y la cámara quedaría encendida sin lector.
        if (cancelled) stopSafely(scanner);
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error instanceof Error && error.name === "NotAllowedError"
              ? "Diste permiso denegado a la cámara."
              : "No se pudo abrir la cámara.",
          );
          setOpen(false);
        }
      }
    })();

    return () => {
      cancelled = true;

      const scanner = scannerRef.current;
      scannerRef.current = null;

      if (scanner) stopSafely(scanner);
    };
  }, [open, onRead]);

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" onClick={() => setOpen((value) => !value)}>
        {open ? "Cerrar lector" : "Escanear cédula"}
      </Button>

      {open && (
        <>
          <div id="cedula-reader" className="w-full" />
          {/* El callback de fallo se dispara ~10 veces por segundo, así que no
              sirve para avisar. Sin esta pista el lector parece congelado. */}
          <Text size="xs" className="text-gray-500">
            Enfoca el código de barras del reverso de la cédula, llenando el
            ancho de la pantalla. Toca la imagen para enfocar.
          </Text>
        </>
      )}

      {message && (
        <Text size="xs" className="text-amber-600">
          {message}
        </Text>
      )}
    </div>
  );
}
