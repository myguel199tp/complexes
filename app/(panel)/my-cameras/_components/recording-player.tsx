"use client";

import { useEffect, useState } from "react";
import { Text } from "complexes-next-components";

import { fetchRecordingUrl } from "../services/recordingService";
import { RecordingResponse } from "../services/response/recording";

interface Props {
  conjuntoId: string;
  recording: RecordingResponse;
}

/**
 * Reproduce un segmento grabado.
 *
 * El video llega por `fetch` y no por `<video src>` porque hay que mandar la
 * cabecera del conjunto; el object URL se revoca al cambiar de clip para no ir
 * dejando megas en memoria durante una revisión larga.
 */
export default function RecordingPlayer({ conjuntoId, recording }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;

    setUrl(null);
    setError(null);
    setLoading(true);

    fetchRecordingUrl(conjuntoId, recording.id)
      .then((created) => {
        objectUrl = created;
        // Si el usuario ya cambió de clip, este blob no se va a usar.
        if (cancelled) {
          URL.revokeObjectURL(created);
          return;
        }
        setUrl(created);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [conjuntoId, recording.id]);

  const started = new Date(recording.startedAt);

  return (
    <div className="rounded-lg bg-black/80 p-3">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <Text size="sm" font="bold" className="text-white">
          {recording.cameraName}
        </Text>
        <Text size="sm" className="text-slate-300">
          {started.toLocaleString()}
        </Text>
      </div>

      {loading && (
        <div className="flex h-64 items-center justify-center">
          <Text size="sm" className="text-slate-300">
            Cargando grabación…
          </Text>
        </div>
      )}

      {error && (
        <div className="flex h-64 items-center justify-center px-4 text-center">
          <Text size="sm" className="text-red-300">
            {error}
          </Text>
        </div>
      )}

      {url && (
        <video
          key={url}
          src={url}
          controls
          autoPlay
          className="max-h-[70vh] w-full rounded"
        />
      )}

      <Text size="sm" className="mt-2 text-slate-400">
        Esta reproducción quedó registrada en la bitácora del conjunto.
      </Text>
    </div>
  );
}
