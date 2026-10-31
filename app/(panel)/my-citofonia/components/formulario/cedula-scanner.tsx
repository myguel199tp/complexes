"use client";

import React, { useEffect, useRef, useState } from "react";
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
 * La cámara y el bucle de lectura son propios a propósito. `Html5Qrcode.start()`
 * pide 1920x1080, pero antes de decodificar copia cada frame a un canvas del
 * tamaño del recuadro en pantalla (~350 px en el celular): un PDF417 de cédula
 * mete cientos de barras en ~5 cm, a ese ancho cada barra queda por debajo de un
 * píxel y nunca decodificaba. Aquí se decodifica el frame a resolución completa.
 */

/** Pausa entre intentos: zxing bloquea el hilo ~100-200 ms por frame grande. */
const SCAN_GAP_MS = 120;

interface Decoder {
  engine: "nativo" | "zxing";
  /** Texto del PDF417 si lo hay en el frame actual, `null` si no. */
  decode: (video: HTMLVideoElement) => Promise<string | null>;
}

interface NativeBarcodeDetector {
  new (options: { formats: string[] }): {
    detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
  };
  getSupportedFormats?: () => Promise<string[]>;
}

/**
 * El `BarcodeDetector` nativo (Android) lee PDF417 mucho mejor que zxing, y en
 * cualquier rotación. `getSupportedFormats()` responde sin construir nada; el
 * constructor va en el try porque en los Android sin el módulo de Play
 * Services lanza.
 */
async function createNativeDecoder(): Promise<Decoder | null> {
  const BarcodeDetector = (
    window as unknown as { BarcodeDetector?: NativeBarcodeDetector }
  ).BarcodeDetector;

  if (!BarcodeDetector?.getSupportedFormats) return null;

  try {
    if (!(await BarcodeDetector.getSupportedFormats()).includes("pdf417")) {
      return null;
    }

    const detector = new BarcodeDetector({ formats: ["pdf417"] });

    return {
      engine: "nativo",
      decode: async (video) => (await detector.detect(video))[0]?.rawValue ?? null,
    };
  } catch {
    return null;
  }
}

/** Lo que se usa del zxing que trae html5-qrcode (su `.d.ts` no lo exporta). */
interface ZXingModule {
  PDF417Reader: new () => { decode: (bitmap: unknown) => { getText: () => string } };
  BinaryBitmap: new (binarizer: unknown) => unknown;
  HybridBinarizer: new (source: unknown) => unknown;
  HTMLCanvasElementLuminanceSource: new (canvas: HTMLCanvasElement) => unknown;
}

/** Copia el frame a tamaño real, girado 90° si `rotate`. */
function drawFrame(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  rotate: boolean,
): boolean {
  const { videoWidth: width, videoHeight: height } = video;
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!width || !height || !context) return false;

  canvas.width = rotate ? height : width;
  canvas.height = rotate ? width : height;

  if (rotate) context.setTransform(0, 1, -1, 0, height, 0);
  context.drawImage(video, 0, 0);
  context.setTransform(1, 0, 0, 1, 0, 0);

  return true;
}

/**
 * Respaldo para iOS y escritorio. El PDF417 de zxing solo prueba 0° y 180°: si
 * el portero sostiene la cédula vertical nunca la encuentra, así que se alterna
 * un frame derecho y uno girado.
 */
async function createZxingDecoder(): Promise<Decoder> {
  // Import dinámico: son ~24 mil líneas que solo hacen falta con el lector abierto.
  const ZXing = (await import(
    "html5-qrcode/third_party/zxing-js.umd"
  )) as unknown as ZXingModule;

  const reader = new ZXing.PDF417Reader();
  const canvas = document.createElement("canvas");
  let rotate = false;

  return {
    engine: "zxing",
    decode: async (video) => {
      rotate = !rotate;

      if (!drawFrame(canvas, video, rotate)) return null;

      try {
        const bitmap = new ZXing.BinaryBitmap(
          new ZXing.HybridBinarizer(
            new ZXing.HTMLCanvasElementLuminanceSource(canvas),
          ),
        );

        return reader.decode(bitmap).getText();
      } catch {
        // NotFound / Checksum / Format: en este frame no hay código legible.
        return null;
      }
    },
  };
}

/** El portero ve esto en vez del nombre técnico del error de `getUserMedia`. */
function cameraErrorMessage(error: unknown): string {
  switch ((error as { name?: string } | null)?.name) {
    case "NotAllowedError":
      return "No hay permiso para usar la cámara. Actívalo en la configuración del navegador.";
    case "NotReadableError":
      return "La cámara está ocupada por otra aplicación o por la foto del visitante.";
    case "NotFoundError":
    case "OverconstrainedError":
      return "No se encontró una cámara disponible.";
    default:
      return "No se pudo abrir la cámara.";
  }
}

/** Lo que se le muestra al portero mientras el lector está abierto. */
interface ScanStatus {
  engine: Decoder["engine"];
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
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // El formulario pasa `onRead` como arrow inline y se re-renderiza solo (los
  // cupos de parqueadero se refrescan cada 30 s). Con `onRead` en las
  // dependencias del efecto, cada render apagaba y volvía a abrir la cámara.
  const onReadRef = useRef(onRead);
  useEffect(() => {
    onReadRef.current = onRead;
  }, [onRead]);

  useEffect(() => {
    if (!open) {
      setStatus(null);
      return;
    }

    let cancelled = false;
    let stream: MediaStream | null = null;
    let timer: number | undefined;
    let ticker: number | undefined;
    let frames = 0;
    let lastUnparsed: string | null = null;

    // El aviso del intento anterior ya no aplica a esta lectura.
    setMessage(null);

    void (async () => {
      // `mediaDevices` solo existe en HTTPS o localhost: abierta por la IP de
      // la red local la página no tiene cámara y antes no decía nada.
      if (!navigator.mediaDevices?.getUserMedia) {
        setMessage(
          "La cámara solo está disponible cuando la página abre por HTTPS.",
        );
        setOpen(false);
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });

        // El cleanup corrió mientras se pedía la cámara y no tenía qué apagar.
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        // A la distancia de una cédula el foco fijo de algunos Android deja las
        // barras borrosas.
        const [track] = stream.getVideoTracks();
        const focusModes = (
          track?.getCapabilities?.() as { focusMode?: string[] } | undefined
        )?.focusMode;

        if (focusModes?.includes("continuous")) {
          await track
            .applyConstraints({
              advanced: [{ focusMode: "continuous" } as MediaTrackConstraintSet],
            })
            .catch(() => {});
        }

        const video = videoRef.current;
        if (cancelled || !video) return;

        video.srcObject = stream;
        await video.play();

        const decoder = (await createNativeDecoder()) ?? (await createZxingDecoder());
        if (cancelled) return;

        const startedAt = Date.now();
        setStatus({ engine: decoder.engine, frames: 0, seconds: 0 });

        // Una vez por segundo y no por frame: suficiente para ver que el
        // contador se mueve sin re-renderizar el <video> a cada intento.
        ticker = window.setInterval(() => {
          setStatus({
            engine: decoder.engine,
            frames,
            seconds: Math.round((Date.now() - startedAt) / 1000),
          });
        }, 1000);

        const scan = async () => {
          if (cancelled) return;

          frames += 1;
          const raw = await decoder.decode(video).catch(() => null);

          if (cancelled) return;

          if (raw) {
            const parsed = parseCedulaPdf417(raw);

            if (parsed) {
              onReadRef.current(parsed);
              setMessage(null);
              setOpen(false);
              return;
            }

            // Sí hubo lectura: el problema son las posiciones del layout, no el
            // enfoque. Se registra una vez por código y no en cada frame.
            if (raw !== lastUnparsed) {
              lastUnparsed = raw;
              console.warn("[cedula-scanner] PDF417 leído sin parsear", raw);
              setMessage(
                "Se leyó el código pero no tiene el formato esperado. Escribe los datos a mano.",
              );
            }
          }

          timer = window.setTimeout(scan, SCAN_GAP_MS);
        };

        void scan();
      } catch (error) {
        if (cancelled) return;

        console.error("[cedula-scanner]", error);
        setMessage(cameraErrorMessage(error));
        setOpen(false);
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.clearInterval(ticker);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [open]);

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" onClick={() => setOpen((value) => !value)}>
        {open ? "Cerrar lector" : "Escanear cédula"}
      </Button>

      {open && (
        <>
          {/* `muted` + `playsInline`: sin ellos iOS no reproduce el stream. */}
          <video
            ref={videoRef}
            muted
            playsInline
            className="w-full rounded-md border"
          />
          <Text size="xs" className="text-gray-500">
            Pon el código de barras del reverso de la cédula frente a la
            cámara, bien iluminado y ocupando al menos la mitad del ancho.
          </Text>

          {/* Nada en la pantalla cambia mientras no decodifica, así que sin
              este contador el lector se ve igual de congelado que uno roto. */}
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
