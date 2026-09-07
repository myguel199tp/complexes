"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Text } from "complexes-next-components";
import { IoCameraOutline, IoRefreshOutline } from "react-icons/io5";
import { countFaces } from "@/app/helpers/faceDetection";

/** Cada cuánto se mira el vídeo para decirle a la persona cómo va. */
const PREVIEW_INTERVAL_MS = 700;

/** Calidad del JPEG. Suficiente para reconocer una cara sin subir 4 MB. */
const JPEG_QUALITY = 0.85;

/** Lado mayor de la foto guardada. Una cara no necesita más. */
const MAX_SIDE = 720;

type Framing = "checking" | "none" | "many" | "ok";

const FRAMING_HINT: Record<Framing, string> = {
  checking: "Buscando tu rostro...",
  none: "No te vemos. Acércate y busca un sitio con más luz.",
  many: "Hay más de una persona en cuadro. Debes salir solo tú.",
  ok: "Te vemos bien. Puedes tomar la foto.",
};

const FRAMING_TONE: Record<Framing, string> = {
  checking: "text-slate-400",
  none: "text-amber-300",
  many: "text-amber-300",
  ok: "text-emerald-400",
};

interface Props {
  /** Foto aceptada, ya validada. `null` mientras no haya ninguna. */
  value: Blob | null;
  onChange: (photo: Blob | null) => void;
}

/**
 * Captura de la foto de rostro.
 *
 * En vivo y sin opción de subir archivo: lo que hace que la foto sea de esta
 * persona es que se tome ahora. Permitir elegir un archivo la convertía en una
 * imagen cualquiera, y entonces no acredita nada.
 *
 * La validación de que hay una cara corre aquí, en el navegador. Es una ayuda
 * para que nadie suba por error una foto del techo, no una prueba de identidad:
 * quien quiera saltársela puede.
 */
export default function FaceCapture({ value, onChange }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [framing, setFraming] = useState<Framing>("checking");
  const [isCapturing, setCapturing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        "Este navegador no permite usar la cámara. Abre el enlace desde Chrome o Safari en tu celular.",
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        // `user` es la cámara frontal: la foto es de quien sostiene el celular.
        video: { facingMode: "user", width: { ideal: 1280 } },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
    } catch (error) {
      // El navegador distingue "dijo que no" de "no hay cámara", y el consejo
      // que se le da a la persona es distinto en cada caso.
      const denied =
        error instanceof DOMException &&
        (error.name === "NotAllowedError" || error.name === "SecurityError");

      setCameraError(
        denied
          ? "Necesitamos tu permiso para usar la cámara. Actívalo en el candado de la barra de direcciones y vuelve a intentar."
          : "No pudimos abrir la cámara. Revisa que ninguna otra aplicación la esté usando.",
      );
    }
  }, []);

  useEffect(() => {
    if (!value) startCamera();

    return stopCamera;
    // Sólo al montar y al descartar una foto: mientras hay foto aceptada la
    // cámara está apagada a propósito.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Encuadre en vivo. Se apaga si ya hay foto aceptada o si la cámara falló:
  // sin vídeo no hay nada que mirar y el modelo se cargaría para nada.
  useEffect(() => {
    if (value || cameraError) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      const video = videoRef.current;

      if (video && video.readyState >= 2) {
        try {
          const faces = await countFaces(video);

          if (!cancelled) {
            setFraming(faces === 0 ? "none" : faces > 1 ? "many" : "ok");
          }
        } catch {
          // El modelo se descarga de un CDN: si no está disponible, la persona
          // no se queda encerrada — se la deja tomar la foto igual y el
          // encuadre se comprueba al capturar.
          if (!cancelled) setFraming("ok");
        }
      }

      if (!cancelled) timer = setTimeout(tick, PREVIEW_INTERVAL_MS);
    };

    tick();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value, cameraError]);

  async function capture() {
    const video = videoRef.current;
    if (!video) return;

    setCapturing(true);

    try {
      const scale = Math.min(
        1,
        MAX_SIDE / Math.max(video.videoWidth, video.videoHeight),
      );

      const canvas = document.createElement("canvas");
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);

      const context = canvas.getContext("2d");
      if (!context) return;

      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Se valida el fotograma que se va a guardar, no el que se estaba
      // viendo: entre el último chequeo y el disparo la persona pudo moverse.
      const faces = await countFaces(canvas).catch(() => 1);

      if (faces !== 1) {
        setFraming(faces === 0 ? "none" : "many");
        return;
      }

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
      );

      if (!blob) return;

      setPreview(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      onChange(blob);
      stopCamera();
    } finally {
      setCapturing(false);
    }
  }

  function retake() {
    setPreview(null);
    setFraming("checking");
    onChange(null);
  }

  if (value && preview) {
    return (
      <div className="space-y-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={preview}
          alt="Foto de tu rostro"
          className="mx-auto h-56 w-56 rounded-2xl border border-emerald-400/40 object-cover"
        />
        <Button
          type="button"
          size="sm"
          rounded="md"
          onClick={retake}
          className="mx-auto flex items-center gap-2"
        >
          <IoRefreshOutline size={16} />
          Tomar otra
        </Button>
      </div>
    );
  }

  if (cameraError) {
    return (
      <div className="space-y-3 rounded-2xl border border-amber-400/30 bg-amber-400/5 p-4">
        <Text size="sm" className="text-amber-200">
          {cameraError}
        </Text>
        <Button type="button" size="sm" rounded="md" onClick={startCamera}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative mx-auto h-56 w-56 overflow-hidden rounded-2xl border border-white/10 bg-black">
        <video
          ref={videoRef}
          playsInline
          muted
          // Espejo: la gente se encuadra mirándose, y sin esto se mueve al
          // lado contrario del que espera.
          className="h-full w-full -scale-x-100 object-cover"
        />
      </div>

      <Text size="sm" className={`text-center ${FRAMING_TONE[framing]}`}>
        {FRAMING_HINT[framing]}
      </Text>

      <Button
        type="button"
        colVariant="success"
        size="md"
        rounded="md"
        onClick={capture}
        disabled={isCapturing || framing !== "ok"}
        className="mx-auto flex items-center gap-2"
      >
        <IoCameraOutline size={18} />
        {isCapturing ? "Tomando..." : "Tomar foto"}
      </Button>
    </div>
  );
}
