"use client";
import { useState } from "react";
import { Button } from "complexes-next-components";
import { MeetingResponse } from "../services/response/councilResponse";
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

interface Props {
  meeting: MeetingResponse;
}

export default function MeetingDetail({ meeting }: Props) {
  const [showVoteForm, setShowVoteForm] = useState(false);

  const startMutation = useStartMeetingMutation();
  const endMutation = useEndMeetMutation();
  const signMutation = useSignMutation();

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
        <div className="flex items-center gap-3">
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
        </div>
      )}

      {/* ── FASES 5-8: Reunión en curso ── */}
      {meeting.status === "ongoing" && (
        <div className="space-y-5">
          {/* Videollamada */}
          <VideoCallPanel meetingId={meeting.id} />

          {/* Votaciones existentes */}
          {votes.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700">Votaciones</p>
              {votes.map((vote) => (
                <VoteCard key={vote.id} vote={vote} meetingOngoing />
              ))}
            </div>
          )}

          {/* Crear votación */}
          {showVoteForm ? (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <p className="text-sm font-semibold text-gray-800">
                  Nueva votación
                </p>
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
          {/* Votaciones (solo resultados) */}
          {votes.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700">
                Votaciones realizadas
              </p>
              {votes.map((vote) => (
                <VoteCard key={vote.id} vote={vote} meetingOngoing={false} />
              ))}
            </div>
          )}

          {/* Acta */}
          {minutes && (
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">
              <p className="text-sm font-semibold text-gray-700">
                📄 Acta de reunión
              </p>
              {minutes.summary && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Resumen
                  </p>
                  <p className="text-sm text-gray-700">{minutes.summary}</p>
                </div>
              )}
              {minutes.decisions && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Decisiones
                  </p>
                  <p className="text-sm text-gray-700">{minutes.decisions}</p>
                </div>
              )}
            </div>
          )}

          {/* Firma */}
          <div className="flex items-center gap-4 flex-wrap">
            <Button
              size="sm"
              colVariant="success"
              rounded="md"
              onClick={() => signMutation.mutate(meeting.id)}
              disabled={signMutation.isPending}
            >
              {signMutation.isPending ? "Firmando..." : "✍ Firmar acta"}
            </Button>
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
              <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide bg-gray-50">
                Firmas del acta
              </p>
              {signatures.map((sig) => (
                <div key={sig.id} className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">
                      {sig.userId.slice(0, 8)}…
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(sig.signedAt).toLocaleDateString("es-CO", {
                        dateStyle: "medium",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">
                    {sig.documentHash}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
