"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Volumen del micrófono, de 0 a 1, mientras `active` esté encendido.
 *
 * Alimenta la animación del orbe para que reaccione a la voz de verdad y no con
 * un latido de adorno: la diferencia entre "está animado" y "me está oyendo" es
 * justamente que responda a lo que uno dice.
 *
 * Abre su propio stream, aparte del que usa SpeechRecognition. La API de
 * reconocimiento no expone la señal de audio, así que no hay forma de leer el
 * nivel del suyo. Si el navegador niega el permiso o no soporta getUserMedia,
 * devuelve 0 y el orbe cae a su animación sintética: se pierde el detalle, no
 * la función.
 */
export function useMicLevel(active: boolean): number {
  const [level, setLevel] = useState(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active || typeof window === "undefined") {
      setLevel(0);
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) return;

    let stream: MediaStream | null = null;
    let context: AudioContext | null = null;
    let cancelled = false;

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // El permiso puede resolverse después de que el usuario ya soltó el
        // micrófono; sin esto quedaría el stream abierto y el led encendido.
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;

        context = new AudioCtx();

        const analyser = context.createAnalyser();
        // Ventana corta: interesa la reacción inmediata, no el detalle
        // espectral, y cuanto menor sea menos cuesta cada fotograma.
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.75;

        context.createMediaStreamSource(stream).connect(analyser);

        const samples = new Uint8Array(analyser.fftSize);
        let lastPublished = 0;

        const read = () => {
          analyser.getByteTimeDomainData(samples);

          // RMS sobre la onda centrada en 128, que es el cero de un Uint8.
          let sum = 0;
          for (const sample of samples) {
            const centered = (sample - 128) / 128;
            sum += centered * centered;
          }

          // El x3 sube el habla normal a un rango visible: sin él, una voz de
          // conversación mueve el orbe un 8% y no se percibe.
          const next = Math.min(1, Math.sqrt(sum / samples.length) * 3);

          // Publicar cada fotograma re-renderiza 60 veces por segundo para
          // cambios que el ojo no distingue.
          if (Math.abs(next - lastPublished) > 0.04) {
            lastPublished = next;
            setLevel(next);
          }

          frameRef.current = requestAnimationFrame(read);
        };

        read();
      } catch {
        // Permiso denegado o dispositivo ocupado: el orbe se anima igual.
        setLevel(0);
      }
    };

    start();

    return () => {
      cancelled = true;

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      stream?.getTracks().forEach((track) => track.stop());
      context?.close().catch(() => undefined);

      setLevel(0);
    };
  }, [active]);

  return level;
}
