"use client";

import Link from "next/link";
import { useState } from "react";
import { ImSpinner9 } from "react-icons/im";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiEdit2,
  FiLock,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";

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
  AssemblyStatusChip,
  CARD,
  Chip,
  MUTED,
  PollOptionList,
  PollOutcome,
} from "../components/assembly-ui";
import {
  ASSEMBLY_MODE_LABELS,
  ASSEMBLY_TYPE_LABELS,
  PollResult,
  VOTE_BASE_LABELS,
  VOTE_TYPE_SHORT_LABELS,
} from "../services/assemblies.types";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { Button } from "@/app/components/ui/form";
import { route } from "@/app/_domain/constants/routes";

/** Roles que arman y corrigen el orden del día. */
const CAN_EDIT_POLLS = ["employee", "admin", "manager"];

const errorBox =
  "rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300";

export default function AssemblyDetailPage({ params }) {
  const { id } = params;

  const role = useConjuntoStore((state) => state.role);
  const canEdit = CAN_EDIT_POLLS.includes(role ?? "");

  const { data: assembly, isLoading: loadingAssembly } =
    useAssemblyDetailQuery(id);
  const { data: polls, isLoading: loadingPolls } = useAssemblyPollsQuery(id);

  const voteMutation = useVoteMutation(id);
  const createPoll = useCreatePollMutation(id);
  const updatePoll = useUpdatePollMutation(id);
  const deletePoll = useDeletePollMutation(id);

  /** Id de la pregunta en edición, o "nueva" mientras se agrega una. */
  const [editing, setEditing] = useState<string | null>(null);

  /**
   * El voto no se puede cambiar, así que va en dos pasos: tocar una opción solo
   * la marca y el botón "Confirmar voto" la envía. Antes cada opción era un
   * botón que votaba al primer toque.
   */
  const [selected, setSelected] = useState<Record<string, string>>({});

  /**
   * Votos confirmados en esta visita. El backend no dice qué votó cada quien,
   * así que al recargar se pierde; si se intenta de nuevo responde "Ya votaste".
   */
  const [myVotes, setMyVotes] = useState<Record<string, string>>({});

  const closed = !!assembly?.closed;
  const pollList: PollResult[] = polls ?? [];

  const handleVote = (pollId: string) => {
    const optionId = selected[pollId];
    if (!optionId) return;

    voteMutation.mutate(
      { pollId, optionId },
      {
        onSuccess: () =>
          setMyVotes((prev) => ({ ...prev, [pollId]: optionId })),
      },
    );
  };

  const handleDelete = (poll: PollResult) => {
    if (!confirm(`¿Quitar la pregunta "${poll.question}" del orden del día?`)) {
      return;
    }

    deletePoll.mutate(poll.pollId);
  };

  if (loadingAssembly || loadingPolls) {
    return (
      <div className="flex h-96 items-center justify-center">
        <ImSpinner9 className="animate-spin text-cyan-700" size={40} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-1 md:p-4" key={id}>
      <Link
        href={route.myConvention}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-700 hover:text-cyan-800 dark:text-cyan-300 dark:hover:text-cyan-200"
      >
        <FiArrowLeft className="shrink-0" />
        Asambleas
      </Link>

      <header className={`${CARD} p-4 md:p-6`}>
        <div className="flex flex-wrap gap-1.5">
          <AssemblyStatusChip assembly={assembly} />
          {assembly?.typeAssembly && (
            <Chip tone="cyan">
              {ASSEMBLY_TYPE_LABELS[assembly.typeAssembly] ??
                assembly.typeAssembly}
            </Chip>
          )}
          {assembly?.mode && (
            <Chip>{ASSEMBLY_MODE_LABELS[assembly.mode] ?? assembly.mode}</Chip>
          )}
        </div>

        <h1 className="mt-3 break-words text-xl font-semibold leading-tight text-slate-900 dark:text-slate-100 md:text-2xl">
          {assembly?.title}
        </h1>

        {assembly?.description && (
          <p className={`mt-1.5 leading-relaxed ${MUTED}`}>
            {assembly.description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-700/70">
          <p className={MUTED}>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {pollList.length}
            </span>{" "}
            {pollList.length === 1 ? "pregunta" : "preguntas"} en el orden del
            día
          </p>

          {canEdit && !closed && editing !== "nueva" && (
            <Button
              size="sm"
              rounded="sm"
              colVariant="primary"
              leftIcon={<FiPlus />}
              onClick={() => setEditing("nueva")}
            >
              Agregar pregunta
            </Button>
          )}
        </div>
      </header>

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

      {pollList.length === 0 && editing !== "nueva" && (
        <div
          className={`${CARD} border-dashed px-4 py-10 text-center ${MUTED}`}
        >
          Todavía no hay preguntas en el orden del día.
        </div>
      )}

      {pollList.map((poll, index) => {
        if (editing === poll.pollId) {
          return (
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
          );
        }

        const votedId = myVotes[poll.pollId] ?? null;
        const votedOption = poll.options.find((o) => o.id === votedId);
        const selectedId = selected[poll.pollId] ?? null;
        const canVote = !closed && !votedId;

        const isVotingThis =
          voteMutation.isPending &&
          voteMutation.variables?.pollId === poll.pollId;
        const voteError =
          voteMutation.variables?.pollId === poll.pollId
            ? (voteMutation.error as Error | null)?.message
            : null;
        const deleteError =
          deletePoll.variables === poll.pollId
            ? (deletePoll.error as Error | null)?.message
            : null;

        return (
          <section key={poll.pollId} className={`${CARD} p-4 md:p-6`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-700 dark:text-cyan-300">
                Pregunta {index + 1}
              </span>

              {canEdit &&
                (poll.editable ? (
                  <div className="flex shrink-0 gap-1">
                    <Button
                      size="xs"
                      rounded="sm"
                      variant="ghost"
                      className="text-slate-600 dark:text-slate-300"
                      leftIcon={<FiEdit2 />}
                      onClick={() => setEditing(poll.pollId)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="xs"
                      rounded="sm"
                      variant="ghost"
                      colVariant="danger"
                      leftIcon={<FiTrash2 />}
                      loading={
                        deletePoll.isPending &&
                        deletePoll.variables === poll.pollId
                      }
                      disabled={deletePoll.isPending}
                      onClick={() => handleDelete(poll)}
                    >
                      Quitar
                    </Button>
                  </div>
                ) : (
                  // La regla es del backend; aquí solo se explica por qué ya no
                  // hay botones, que es lo que la gente pregunta en la reunión.
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <FiLock className="shrink-0" />
                    Con votos: no se edita
                  </span>
                ))}
            </div>

            <h2 className="mt-1.5 break-words text-lg font-semibold leading-snug text-slate-900 dark:text-slate-100">
              {poll.question}
            </h2>

            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-800 dark:text-slate-100">
                {VOTE_TYPE_SHORT_LABELS[poll.voteType] ?? poll.voteType}
              </span>{" "}
              · se aprueba con {poll.requiredPercentage}%{" "}
              {VOTE_BASE_LABELS[poll.base] ?? ""}
            </p>

            <div className="mt-4">
              <PollOptionList
                poll={poll}
                selectedId={canVote ? selectedId : null}
                votedId={votedId}
                disabled={voteMutation.isPending}
                onSelect={
                  canVote
                    ? (optionId) =>
                        setSelected((prev) => ({
                          ...prev,
                          [poll.pollId]: optionId,
                        }))
                    : undefined
                }
              />
            </div>

            {voteError && <p className={`mt-3 ${errorBox}`}>{voteError}</p>}
            {deleteError && <p className={`mt-3 ${errorBox}`}>{deleteError}</p>}

            {votedOption && (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
                <FiCheckCircle className="mt-0.5 shrink-0" />
                <span className="min-w-0 break-words">
                  Tu voto por <strong>«{votedOption.option}»</strong> quedó
                  registrado.
                </span>
              </div>
            )}

            {canVote && (
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedId
                    ? "Revisa tu elección: el voto no se puede cambiar."
                    : "Elige una opción para votar."}
                </p>
                <Button
                  size="md"
                  rounded="sm"
                  colVariant="primary"
                  className="w-full sm:w-auto"
                  disabled={!selectedId || voteMutation.isPending}
                  loading={isVotingThis}
                  onClick={() => handleVote(poll.pollId)}
                >
                  {isVotingThis ? "Registrando voto..." : "Confirmar voto"}
                </Button>
              </div>
            )}

            <div className="mt-4 border-t border-slate-200 pt-3 dark:border-slate-700/70">
              <PollOutcome poll={poll} closed={closed} />
            </div>
          </section>
        );
      })}
    </div>
  );
}
