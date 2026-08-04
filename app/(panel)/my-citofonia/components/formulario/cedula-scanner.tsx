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

/**
 * El rechazo de `start()` no siempre es un `Error`: cuando el fallo viene de
 * `getUserMedia`, la librería lo envuelve en un string ("Error getting
 * userMedia, error = NotAllowedError: ..."). Mirando solo `error.name` el
 * permiso denegado —el caso más común en el celular del portero— se reportaba
 * como un fallo genérico de cámara.
 */
function isPermissionDenied(error: unknown): boolean {
  if (error instanceof Error) return error.name === "NotAllowedError";

  return typeof error === "string" && error.includes("NotAllowedError");
}

/** Lo que se le muestra al portero mientras el lector está abierto. */
interface ScanStatus {
  engine: "nativo" | "zxing";
  /** Frames que el decodificador ya miró: si no sube, no está analizando. */
  frames: number;
  seconds: number;
}

export function CedulaScanner({
  onRead,
}: {
  onRead: (data: CedulaData) => void;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<ScanStatus | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  // Contador en ref y no en estado: el callback corre ~10 veces por segundo y
  // un `setState` por frame vuelve a montar el <video> a mitad de lectura.
  const framesRef = useRef(0);

  useEffect(() => {
    if (!open) {
      setStatus(null);
      return;
    }

    let cancelled = false;
    let ticker: number | undefined;
    framesRef.current = 0;

    void (async () => {
      // Import dinámico: la librería toca `window` al cargarse y este árbol se
      // renderiza también en el servidor.
      const { Html5Qrcode, Html5QrcodeSupportedFormats } = await import(
        "html5-qrcode"
      );

      if (cancelled) return;

      const useNative = await supportsNativePdf417();

      if (cancelled) return;

      const startedAt = Date.now();

      setStatus({ engine: useNative ? "nativo" : "zxing", frames: 0, seconds: 0 });

      // Una vez por segundo en vez de una por frame: suficiente para ver que el
      // contador se mueve, sin re-renderizar el <video> diez veces por segundo.
      ticker = window.setInterval(() => {
        setStatus((current) =>
          current
            ? {
                ...current,
                frames: framesRef.current,
                seconds: Math.round((Date.now() - startedAt) / 1000),
              }
            : current,
        );
      }, 1000);

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
          // Este primer argumento admite exactamente una llave (`facingMode` o
          // `deviceId`); con más lanza antes siquiera de pedir la cámara. La
          // resolución va abajo en `videoConstraints`, que además tiene
          // prioridad sobre esto.
          { facingMode: "environment" },
          // Sin `qrbox`: recorta el frame a esa caja y descarta justo los
          // píxeles que hacen falta para resolver las barras.
          {
            fps: 10,
            disableFlip: true,
            // Resolución alta a propósito: un PDF417 de cédula mete cientos de
            // barras en ~5 cm y a 640x480 (el default de getUserMedia) cada
            // barra no llega a un píxel, así que nunca decodifica.
            videoConstraints: {
              facingMode: "environment",
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
          },
          (decoded) => {
            const parsed = parseCedulaPdf417(decoded);

            if (!parsed) {
              // Sí hubo lectura: el problema son las posiciones del layout, no
              // el enfoque. Sin este log no hay forma de ajustarlas.
              console.warn("[cedula-scanner] PDF417 leído sin parsear", decoded);
              setMessage(
                "Se leyó el código pero no tiene el formato esperado. Escribe los datos a mano.",
              );
              return;
            }

            onRead(parsed);
            setMessage(null);
            setOpen(false);
          },
          // Se dispara una vez por frame analizado sin resultado. No sirve para
          // avisar de nada, pero es la única señal de que el lector está vivo.
          () => {
            framesRef.current += 1;
          },
        );

        // El cleanup pudo correr mientras `start()` estaba en vuelo: entonces su
        // `stop()` no hizo nada y la cámara quedaría encendida sin lector.
        if (cancelled) stopSafely(scanner);
      } catch (error) {
        // La librería rechaza con strings tanto como con `Error`, así que sin
        // este log cualquier fallo de configuración se ve igual que un permiso
        // denegado y no hay forma de distinguirlos desde el aviso.
        console.error("[cedula-scanner]", error);

        if (!cancelled) {
          setMessage(
            isPermissionDenied(error)
              ? "Diste permiso denegado a la cámara."
              : "No se pudo abrir la cámara.",
          );
          setOpen(false);
        }
      }
    })();

    return () => {
      cancelled = true;

      if (ticker) window.clearInterval(ticker);

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
          {/* Nada en la pantalla cambia mientras no decodifica, así que sin
              este contador el lector se ve igual de congelado que uno roto. */}
          <Text size="xs" className="text-gray-500">
            Enfoca el código de barras del reverso de la cédula, llenando el
            ancho de la pantalla. Toca la imagen para enfocar.
          </Text>

          {status && (
            <Text
              size="xs"
              className={
                status.seconds >= 3 && status.frames === 0
                  ? "text-amber-600"
                  : "text-gray-500"
              }
            >
              {status.frames === 0
                ? status.seconds >= 3
                  ? `El lector no está analizando la imagen (motor ${status.engine}, ${status.seconds} s). Cierra y vuelve a abrir.`
                  : `Iniciando el lector (motor ${status.engine})…`
                : `Buscando el código: ${status.frames} imágenes analizadas en ${status.seconds} s (motor ${status.engine}).`}
            </Text>
          )}
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
