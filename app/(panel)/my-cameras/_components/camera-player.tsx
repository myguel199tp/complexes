"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Text } from "complexes-next-components";
import {
  playlistAbsoluteUrl,
  startStream,
  stopStream,
  streamAuthHeaders,
} from "../services/cameraService";

interface CameraPlayerProps {
  conjuntoId: string;
  cameraId: string;
  cameraName: string;
}

type PlayerState = "connecting" | "playing" | "error";

export default function CameraPlayer({
  conjuntoId,
  cameraId,
  cameraName,
}: CameraPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [state, setState] = useState<PlayerState>("connecting");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    const headers = streamAuthHeaders(conjuntoId);

    async function connect() {
      setState("connecting");
      setErrorMsg("");
      try {
        const { playlistUrl } = await startStream(conjuntoId, cameraId);
        if (cancelled) return;

        const src = playlistAbsoluteUrl(playlistUrl);
        const video = videoRef.current;
        if (!video) return;

        if (Hls.isSupported()) {
          const hls = new Hls({
            lowLatencyMode: true,
            liveSyncDurationCount: 2,
            xhrSetup: (xhr) => {
              Object.entries(headers).forEach(([k, v]) =>
                xhr.setRequestHeader(k, v),
              );
            },
          });
          hlsRef.current = hls;
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => undefined);
            setState("playing");
          });
          hls.on(Hls.Events.ERROR, (_evt, data) => {
            if (data.fatal) {
              setErrorMsg(
                "No se pudo reproducir el video de la cámara. Verifica la conexión.",
              );
              setState("error");
            }
          });
        } else {
          // Fallback: Safari con HLS nativo (no admite cabeceras personalizadas).
          video.src = src;
          video.play().catch(() => undefined);
          setState("playing");
        }
      } catch (err) {
        if (cancelled) return;
        setErrorMsg(
          err instanceof Error ? err.message : "Error al conectar con la cámara",
        );
        setState("error");
      }
    }

    connect();

    return () => {
      cancelled = true;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      // Apaga el stream en el servidor para liberar CPU.
      void stopStream(conjuntoId, cameraId);
    };
  }, [conjuntoId, cameraId]);

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden aspect-video">
      <video
        ref={videoRef}
        controls
        muted
        playsInline
        className="w-full h-full object-contain bg-black"
      />

      {state !== "playing" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-center px-4">
          {state === "connecting" && (
            <Text size="sm" colVariant="on">
              Conectando con {cameraName}…
            </Text>
          )}
          {state === "error" && (
            <Text size="sm" colVariant="on">
              {errorMsg}
            </Text>
          )}
        </div>
      )}
    </div>
  );
}
