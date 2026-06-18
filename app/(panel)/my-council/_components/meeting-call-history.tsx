"use client";
import { useMeetingHistoryQuery, useRecordingUrlQuery } from "./use-call-query";

interface Props {
  meetingId: string;
}

const CALL_STATUS_LABEL: Record<string, string> = {
  created: "Creada",
  "in-progress": "En curso",
  completed: "Finalizada",
  failed: "Fallida",
};

const RECORDING_STATUS_LABEL: Record<string, string> = {
  none: "Sin grabación",
  pending: "Pendiente",
  processing: "Procesando",
  available: "Disponible",
  failed: "Falló",
};

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("es-CO", { dateStyle: "medium", timeStyle: "short" });
}

function formatDuration(seconds: number | null) {
  if (!seconds) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

export default function MeetingCallHistory({ meetingId }: Props) {
  const { data: history, isLoading } = useMeetingHistoryQuery(meetingId);
  const { data: recording } = useRecordingUrlQuery(meetingId, !!history?.calls.length);

  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
      </div>
    );
  }

  const calls = history?.calls ?? [];

  if (calls.length === 0) {
    return (
      <p className="text-xs text-gray-400 italic">
        No se han registrado videollamadas para esta reunión.
      </p>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <p className="px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
        Historial de videollamadas
      </p>

      {recording?.url && (
        <div className="px-4 py-3 border-b border-gray-100 space-y-1.5">
          <p className="text-xs font-medium text-gray-500">
            🎬 Grabación más reciente · {formatDuration(recording.durationSec ?? null)}
          </p>
          <a
            href={recording.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Ver grabación
          </a>
        </div>
      )}

      <div className="divide-y divide-gray-100">
        {calls.map((call) => (
          <div key={call.id} className="px-4 py-3 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-800">
                {formatDateTime(call.startedAt)} — {formatDateTime(call.endedAt)}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full border bg-gray-50 text-gray-600">
                {CALL_STATUS_LABEL[call.status] ?? call.status}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Grabación: {RECORDING_STATUS_LABEL[call.recordingStatus] ?? call.recordingStatus}
            </p>

            {call.participants.length > 0 && (
              <div className="pl-3 border-l-2 border-gray-100 space-y-1">
                {call.participants.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between text-xs text-gray-500"
                  >
                    <span>{p.identity ?? p.userId.slice(0, 8) + "…"}</span>
                    <span>
                      {formatDateTime(p.joinedAt)} → {formatDateTime(p.leftAt)} ·{" "}
                      {formatDuration(p.durationSec)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
