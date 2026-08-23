"use client";

import { useState } from "react";

import {
  useAssemblyDetailQuery,
  useAssemblyPollsQuery,
  useCreatePollMutation,
  useDeletePollMutation,
  useUpdatePollMutation,
  useVoteMutation,
} from "../queries/assemblies.queries";
import PollEditor from "../components/poll-editor";
import {
  PollResult,
  VOTE_TYPE_LABELS,
} from "../services/assemblies.types";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

/** Roles que arman y corrigen el orden del día. */
const CAN_EDIT_POLLS = ["employee", "admin", "manager"];

export default function AssemblyDetailPage({ params }) {
  const { id } = params;

  const role = useConjuntoStore((state) => state.role);
  const canEdit = CAN_EDIT_POLLS.includes(role ?? "");

  const { data: assembly } = useAssemblyDetailQuery(id);
  const { data: polls } = useAssemblyPollsQuery(id);

  const voteMutation = useVoteMutation(id);
  const createPoll = useCreatePollMutation(id);
  const updatePoll = useUpdatePollMutation(id);
  const deletePoll = useDeletePollMutation(id);

  /** Id de la pregunta en edición, o "nueva" mientras se agrega una. */
  const [editing, setEditing] = useState<string | null>(null);

  const handleVote = (pollId: string, optionId: string) => {
    voteMutation.mutate({ pollId, optionId });
  };

  const handleDelete = (poll: PollResult) => {
    if (!confirm(`¿Quitar la pregunta "${poll.question}" del orden del día?`)) {
      return;
    }

    deletePoll.mutate(poll.pollId);
  };

  return (
    <div className="p-4 space-y-6" key={id}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{assembly?.title}</h1>
          {assembly?.description && (
            <p className="text-sm text-gray-500 mt-1">{assembly.description}</p>
          )}
        </div>

        {canEdit && !assembly?.closed && editing !== "nueva" && (
          <button
            onClick={() => setEditing("nueva")}
            className="px-4 py-2 text-sm rounded-lg bg-cyan-600 text-white"
          >
            Agregar pregunta
          </button>
        )}
      </div>

      {(voteMutation.error || deletePoll.error) && (
        <p className="text-sm text-red-600">
          {(voteMutation.error as Error)?.message ??
            (deletePoll.error as Error)?.message}
        </p>
      )}

      {editing === "nueva" && (
        <PollEditor
          onSubmit={(payload) =>
            createPoll.mutate(payload, {
              onSuccess: () => setEditing(null),
            })
          }
          onCancel={() => setEditing(null)}
          isPending={createPoll.isPending}
          error={(createPoll.error as Error)?.message ?? null}
        />
      )}

      {polls?.map((poll: PollResult) =>
        editing === poll.pollId ? (
          <PollEditor
            key={poll.pollId}
            poll={poll}
            onSubmit={(payload) =>
              updatePoll.mutate(
                { pollId: poll.pollId, data: payload },
                { onSuccess: () => setEditing(null) },
              )
            }
            onCancel={() => setEditing(null)}
            isPending={updatePoll.isPending}
            error={(updatePoll.error as Error)?.message ?? null}
          />
        ) : (
          <div key={poll.pollId} className="p-4 border rounded-lg space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="font-medium">{poll.question}</h2>
                <p className="text-xs text-gray-500 mt-1">
                  {VOTE_TYPE_LABELS[poll.voteType]} ·{" "}
                  {poll.requiredPercentage}% requerido
                </p>
              </div>

              {canEdit &&
                (poll.editable ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditing(poll.pollId)}
                      className="px-3 py-1 text-xs rounded-md border"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(poll)}
                      disabled={deletePoll.isPending}
                      className="px-3 py-1 text-xs rounded-md border text-red-600 disabled:opacity-50"
                    >
                      Quitar
                    </button>
                  </div>
                ) : (
                  // La regla es del backend; aquí solo se explica por qué ya no
                  // hay botones, que es lo que la gente pregunta en la reunión.
                  <span className="text-xs text-gray-400">
                    Ya tiene votos: no se puede modificar
                  </span>
                ))}
            </div>

            <div className="flex flex-col gap-2">
              {poll.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleVote(poll.pollId, option.id)}
                  disabled={voteMutation.isPending}
                  className="flex items-center justify-between bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm disabled:opacity-50"
                >
                  <span>{option.option}</span>
                  {poll.emitidos > 0 && (
                    <span className="text-xs">{option.percent}%</span>
                  )}
                </button>
              ))}
            </div>

            {poll.emitidos > 0 && (
              <p className="text-xs text-gray-500">
                {poll.approved
                  ? `Aprobada: ${poll.winner?.option}`
                  : poll.tie
                    ? "Empate: no hay decisión"
                    : "Todavía no alcanza el porcentaje requerido"}
              </p>
            )}
          </div>
        ),
      )}
    </div>
  );
}
