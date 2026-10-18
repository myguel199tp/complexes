"use client";
import { useState } from "react";
import { Button, Text } from "complexes-next-components";
import {
  MEETING_MAX_DURATION_MINUTES,
  MeetingResponse,
} from "../services/response/councilResponse";
import {
  useMeetingVotesQuery,
  useMeetingMinutesQuery,
  useMeetingSignaturesQuery,
} from "./use-meetings-query";
import { useStartMeetingMutation } from "./use-meeting-mutation";
import { useEndMeetMutation } from "./use-end-meet-mutation";
import { useSignMutation } from "./use-sign-mutation";
import VoteCard from "./vote-card";
import CreateVoteForm from "./create-vote-form";
import VideoCallPanel from "./video-call-panel";
import MeetingCallHistory from "./meeting-call-history";
import MeetingTimeLimit, { useMeetingMinutesLeft } from "./meeting-time-limit";
import MinutesUploadForm from "./minutes-upload-form";
import {
  useCanUploadMinutes,
  useOpenMinutesDocument,
} from "./use-minutes-upload";

interface Props {
  meeting: MeetingResponse;
}

export default function MeetingDetail({ meeting }: Props) {
  const [showVoteForm, setShowVoteForm] = useState(false);

  const startMutation = useStartMeetingMutation();
  const endMutation = useEndMeetMutation();
  const signMutation = useSignMutation();

  const canUploadMinutes = useCanUploadMinutes();
  const openMinutesDocument = useOpenMinutesDocument();
  const [showMinutesForm, setShowMinutesForm] = useState(false);

  // Cumplido el tiempo, el backend rechaza votos aunque aún no la haya cerrado.
  const minutesLeft = useMeetingMinutesLeft(meeting);
  const expired = meeting.status === "ongoing" && minutesLeft <= 0;

  const votesEnabled = meeting.status !== "pending";
  const finishedEnabled = meeting.status === "finished";

  const { data: votes = [] } = useMeetingVotesQuery(
    votesEnabled ? meeting.id : "",
  );
  const { data: minutes } = useMeetingMinutesQuery(
    finishedEnabled ? meeting.id : "",
  );
  const { data: signatures = [] } = useMeetingSignaturesQuery(
    finishedEnabled ? meeting.id : "",
  );

  return (
    <div className="space-y-5">
      {/* ── FASE 4: Iniciar reunión ── */}
      {meeting.status === "pending" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              size="sm"
              colVariant="success"
              rounded="md"
              onClick={() => startMutation.mutate(meeting.id)}
              disabled={startMutation.isPending}
            >
              {startMutation.isPending ? "Iniciando..." : "▶ Iniciar reunión"}
            </Button>
            <span className="text-xs text-gray-400">
              La reunión pasará a estado - En curso
            </span>
            {canUploadMinutes && !showMinutesForm && (
              <button
                type="button"
                onClick={() => setShowMinutesForm(true)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium dark:text-blue-400 dark:hover:text-blue-300"
              >
                📄 Se hizo por fuera: subir el acta
              </button>
            )}
          </div>

          {showMinutesForm && (
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center justify-between px-6 pt-4">
                <Text size="sm" font="semi" className="text-gray-800 dark:text-gray-100">
                  Acta de la reunión
                </Text>
                <button
                  type="button"
                  onClick={() => setShowMinutesForm(false)}
                  className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  Cancelar
                </button>
              </div>
              <MinutesUploadForm
                meetingId={meeting.id}
                onSuccess={() => setShowMinutesForm(false)}
              />
            </div>
          )}
        </div>
      )}

      {/* ── FASES 5-8: Reunión en curso ── */}
      {meeting.status === "ongoing" && (
        <div className="space-y-5">
          <MeetingTimeLimit meeting={meeting} minutesLeft={minutesLeft} />

          {/* Videollamada */}
          <VideoCallPanel meetingId={meeting.id} />

          {/* Votaciones existentes */}
          {votes.length > 0 && (
            <div className="space-y-3">
              <Text size="sm" font="semi" className="text-gray-700">Votaciones</Text>
              {votes.map((vote) => (
                <VoteCard key={vote.id} vote={vote} meetingOngoing={!expired} />
              ))}
            </div>
          )}

          {/* Crear votación */}
          {expired ? null : showVoteForm ? (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <Text size="sm" font="semi" className="text-gray-800">
                  Nueva votación
                </Text>
                <button
                  type="button"
                  onClick={() => setShowVoteForm(false)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Cancelar
                </button>
              </div>
              <CreateVoteForm
                meetingId={meeting.id}
                onSuccess={() => setShowVoteForm(false)}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowVoteForm(true)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              + Crear votación
            </button>
          )}

          {/* Finalizar reunión */}
          <div className="pt-2 border-t border-gray-100">
            <Button
              size="sm"
              colVariant="danger"
              rounded="md"
              onClick={() => endMutation.mutate(meeting.id)}
              disabled={endMutation.isPending}
            >
              {endMutation.isPending ? "Finalizando..." : "■ Finalizar reunión"}
            </Button>
          </div>
        </div>
      )}

      {/* ── FASES 9-11: Reunión finalizada ── */}
      {meeting.status === "finished" && (
        <div className="space-y-5">
          {meeting.finishReason === "time_limit" && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <Text size="sm" font="semi" className="text-amber-800">
                Se cerró automáticamente por tiempo
              </Text>
              <Text size="xs" className="mt-0.5 text-amber-700">
                Nadie la finalizó en las {MEETING_MAX_DURATION_MINUTES / 60}{" "}
                horas que dura una reunión. Quedó con los votos emitidos; en
                cada votación se ve quién no votó.
              </Text>
            </div>
          )}

          {/* Votaciones (solo resultados) */}
          {votes.length > 0 && (
            <div className="space-y-3">
              <Text size="sm" font="semi" className="text-gray-700">
                Votaciones realizadas
              </Text>
              {votes.map((vote) => (
                <VoteCard key={vote.id} vote={vote} meetingOngoing={false} />
              ))}
            </div>
          )}

          {/* Acta */}
          {minutes && (
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <Text size="sm" font="semi" className="text-gray-700">
                  📄 Acta de reunión
                </Text>
                {minutes.hasDocument && (
                  <button
                    type="button"
                    onClick={() => openMinutesDocument(meeting.id)}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Ver documento del acta
                  </button>
                )}
              </div>
              {minutes.summary && (
                <div>
                  <Text size="xs" className="font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Resumen
                  </Text>
                  <Text size="sm" className="text-gray-700 whitespace-pre-line">
                    {minutes.summary}
                  </Text>
                </div>
              )}
              {minutes.decisions && (
                <div>
                  <Text size="xs" className="font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Decisiones
                  </Text>
                  <Text size="sm" className="text-gray-700 whitespace-pre-line">
                    {minutes.decisions}
                  </Text>
                </div>
              )}
            </div>
          )}

          {/* Firma: solo hay qué firmar si la reunión tiene acta. Las cerradas
              antes de que el acta se generara al finalizar no la tienen. */}
          <div className="flex items-center gap-4 flex-wrap">
            {minutes ? (
              <Button
                size="sm"
                colVariant="success"
                rounded="md"
                onClick={() => signMutation.mutate(meeting.id)}
                disabled={signMutation.isPending}
              >
                {signMutation.isPending ? "Firmando..." : "✍ Firmar acta"}
              </Button>
            ) : (
              <Text size="xs" className="text-gray-400 italic">
                Esta reunión no tiene acta para firmar.
              </Text>
            )}
            {signatures.length > 0 && (
              <span className="text-sm text-gray-500">
                {signatures.length} firma
                {signatures.length !== 1 ? "s" : ""} registrada
                {signatures.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Historial de videollamadas */}
          <MeetingCallHistory meetingId={meeting.id} />

          {/* Lista de firmas */}
          {signatures.length > 0 && (
            <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
              <Text size="xs" font="semi" className="px-4 py-2 text-gray-500 uppercase tracking-wide bg-gray-50">
                Firmas del acta
              </Text>
              {signatures.map((sig) => (
                <div key={sig.id} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">
                      {sig.name ?? `${sig.userId.slice(0, 8)}…`}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(sig.signedAt).toLocaleDateString("es-CO", {
                        dateStyle: "medium",
                      })}
                    </span>
                  </div>
                  <Text size="xs" className="text-gray-400 font-mono mt-0.5 truncate">
                    {sig.documentHash}
                  </Text>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
