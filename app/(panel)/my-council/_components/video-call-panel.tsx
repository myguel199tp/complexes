"use client";
import { useState } from "react";
import { Button } from "complexes-next-components";
import { useCallStatusQuery } from "./use-call-query";
import { useStartCallMutation, useEndCallMutation } from "./use-call-mutation";
import { useCallTokenMutation } from "./use-call-token-mutation";
import VideoCallRoom from "./video-call-room";

interface Props {
  meetingId: string;
}

function endsAtLabel(startedAt: string | null, maxDurationMinutes: number) {
  if (!startedAt) return null;
  const end = new Date(startedAt).getTime() + maxDurationMinutes * 60_000;
  return new Date(end).toLocaleTimeString("es-CO", { timeStyle: "short" });
}

export default function VideoCallPanel({ meetingId }: Props) {
  const { data: status } = useCallStatusQuery(meetingId);
  const startMutation = useStartCallMutation();
  const endMutation = useEndCallMutation();
  const tokenMutation = useCallTokenMutation();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const session = status?.session;
  const isActive = session?.status === "in-progress";

  const handleStart = () => {
    startMutation.mutate(meetingId, {
      onSuccess: (data) => setAccessToken(data.accessToken),
    });
  };

  const handleJoin = () => {
    tokenMutation.mutate(meetingId, {
      onSuccess: (data) => setAccessToken(data.accessToken),
    });
  };

  const handleEnd = () => {
    endMutation.mutate(meetingId, {
      onSuccess: () => setAccessToken(null),
    });
  };

  const handleLeave = () => setAccessToken(null);

  if (accessToken) {
    return (
      <div className="border border-gray-800 rounded-xl p-4 bg-gray-900">
        <VideoCallRoom accessToken={accessToken} onLeave={handleLeave} />
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-white">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm font-semibold text-gray-700">📹 Videollamada</p>
        {isActive && (
          <span className="text-xs text-green-600 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            En curso · {status?.participants.length ?? 0} conectado
            {(status?.participants.length ?? 0) !== 1 ? "s" : ""}
            {session?.startedAt && (
              <span className="text-gray-400">
                · termina a las{" "}
                {endsAtLabel(session.startedAt, session.maxDurationMinutes)}
              </span>
            )}
          </span>
        )}
      </div>

      {!isActive && (
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            colVariant="success"
            rounded="md"
            onClick={handleStart}
            disabled={startMutation.isPending}
          >
            {startMutation.isPending ? "Iniciando..." : "▶ Iniciar videollamada"}
          </Button>
          <span className="text-xs text-gray-400">
            Duración máxima 1 hora · se grabará la sesión
          </span>
        </div>
      )}

      {isActive && (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            colVariant="success"
            rounded="md"
            onClick={handleJoin}
            disabled={tokenMutation.isPending}
          >
            {tokenMutation.isPending ? "Conectando..." : "Unirse"}
          </Button>
          <Button
            size="sm"
            colVariant="danger"
            rounded="md"
            onClick={handleEnd}
            disabled={endMutation.isPending}
          >
            {endMutation.isPending ? "Finalizando..." : "Finalizar videollamada"}
          </Button>
        </div>
      )}
    </div>
  );
}
