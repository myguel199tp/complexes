"use client";

import React, { useCallback, useEffect, useState } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { Text, Title } from "complexes-next-components";

import { HeaderAction } from "@/app/components/header";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

import {
  createKnowledge,
  listKnowledge,
  listUnknownQueries,
  removeKnowledge,
  updateKnowledge,
} from "../service/knowledgeService";
import {
  KnowledgeEntry,
  UnknownQuery,
} from "../service/response/knowledgeResponse";
import KnowledgeForm, { KnowledgeDraft } from "./knowledge-form";

/**
 * Lo que este conjunto le tiene enseñado al asistente, y lo que le falta.
 *
 * Las dos mitades van en la misma pantalla a propósito: la cola de preguntas
 * sin responder es la lista de trabajo de la base de conocimiento, y verlas por
 * separado obligaría a recordar una mientras se mira la otra. Escribir una
 * respuesta desde la cola cierra el círculo en un solo gesto —el backend da esa
 * pregunta por atendida sin que haya que marcar nada—.
 */
export default function AssistantKnowledge() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [pending, setPending] = useState<UnknownQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Lo que se está escribiendo, o null si el formulario está cerrado. */
  const [draft, setDraft] = useState<KnowledgeDraft | null>(null);

  const load = useCallback(async () => {
    if (!conjuntoId) return;

    setLoading(true);
    setError(null);

    try {
      // Las dos listas se piden a la vez: son pantallas de la misma cosa y
      // encadenarlas solo sumaría espera.
      const [knowledge, unknown] = await Promise.all([
        listKnowledge(String(conjuntoId), true),
        listUnknownQueries(String(conjuntoId)),
      ]);

      setEntries(knowledge);
      setPending(unknown);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }, [conjuntoId]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (values: KnowledgeDraft) => {
    if (!conjuntoId) return;

    if (values.id) {
      await updateKnowledge(String(conjuntoId), values.id, {
        question: values.question,
        answer: values.answer,
        aliases: values.aliases,
        roles: values.roles,
      });
    } else {
      await createKnowledge(String(conjuntoId), {
        question: values.question,
        answer: values.answer,
        aliases: values.aliases,
        roles: values.roles,
        sourceQueryId: values.sourceQueryId,
      });
    }

    setDraft(null);
    await load();
  };

  /**
   * Apaga o vuelve a encender una entrada.
   *
   * Es lo primero que se hace cuando una respuesta deja de ser cierta, y por eso
   * está a un clic y sin confirmación: mientras se decide qué decir en su lugar,
   * lo importante es que el asistente deje de contestarla.
   */
  const toggleActive = async (entry: KnowledgeEntry) => {
    if (!conjuntoId) return;

    try {
      await updateKnowledge(String(conjuntoId), entry.id, {
        active: !entry.active,
      });

      setEntries((prev) =>
        prev.map((item) =>
          item.id === entry.id ? { ...item, active: !item.active } : item,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    }
  };

  /**
   * Borra del todo.
   *
   * Sí pregunta, al contrario que el interruptor: apagar es reversible y esto
   * no. Existe para lo que nunca debió escribirse ahí —el dato personal de un
   * residente—, no para dejar de responder algo.
   */
  const remove = async (entry: KnowledgeEntry) => {
    if (!conjuntoId) return;

    const confirmed = window.confirm(
      `¿Eliminar "${entry.question}"? Para que el asistente deje de responderla basta con desactivarla.`,
    );

    if (!confirmed) return;

    try {
      await removeKnowledge(String(conjuntoId), entry.id);
      setEntries((prev) => prev.filter((item) => item.id !== entry.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    }
  };

  if (!conjuntoId) {
    return (
      <>
        <HeaderAction title="Lo que sabe el asistente" />
        <Text className="py-10 text-center text-gray-600">
          Selecciona un conjunto para continuar.
        </Text>
      </>
    );
  }

  return (
    <>
      <HeaderAction title="Lo que sabe el asistente" />

      <div className="mt-2 flex flex-col gap-6 lg:px-10">
        <Text size="sm" className="text-gray-600">
          Lo que escribas aquí lo responde el asistente desde el momento en que
          lo guardas. Sirve para lo que es propio de este conjunto —horarios,
          procedimientos, dónde se recoge algo—, no para cifras que cambian:
          esas las consulta él solo.
        </Text>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <Text className="py-10 text-center text-gray-500">Cargando…</Text>
        ) : (
          <>
            <PendingSection
              pending={pending}
              onAnswer={(query) =>
                setDraft({
                  question: query.message,
                  answer: "",
                  aliases: [],
                  roles: [],
                  sourceQueryId: query.id,
                })
              }
            />

            <EntriesSection
              entries={entries}
              onCreate={() =>
                setDraft({
                  question: "",
                  answer: "",
                  aliases: [],
                  roles: [],
                })
              }
              onEdit={(entry) =>
                setDraft({
                  id: entry.id,
                  question: entry.question,
                  answer: entry.answer,
                  aliases: entry.aliases ?? [],
                  roles: entry.roles ?? [],
                })
              }
              onToggle={toggleActive}
              onRemove={remove}
            />
          </>
        )}
      </div>

      {draft ? (
        <KnowledgeForm
          draft={draft}
          onCancel={() => setDraft(null)}
          onSave={save}
        />
      ) : null}
    </>
  );
}

/**
 * Las preguntas que nadie supo responder.
 *
 * Van arriba y no abajo porque son lo accionable: el listado de lo ya enseñado
 * se consulta de vez en cuando, esta cola es la razón de abrir la pantalla.
 */
function PendingSection({
  pending,
  onAnswer,
}: {
  pending: UnknownQuery[];
  onAnswer: (query: UnknownQuery) => void;
}) {
  return (
    <section className="rounded-xl border bg-white shadow-sm">
      <div className="border-b bg-gray-50 px-4 py-3">
        <Title size="sm">Preguntas que no supo responder</Title>
        <Text size="sm" className="text-gray-500">
          {pending.length
            ? "Lo más preguntado primero. Responder una la saca de la lista."
            : "Nada pendiente por ahora."}
        </Text>
      </div>

      {pending.length ? (
        <ul className="divide-y">
          {pending.map((query) => (
            <li
              key={query.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <Text size="sm" className="break-words text-gray-800">
                  {query.message}
                </Text>
                <Text size="sm" className="text-gray-500">
                  {/* El número es lo que decide el orden de la cola: una
                      pregunta hecha treinta veces son treinta personas sin
                      respuesta, no una curiosidad. */}
                  Preguntada {query.count} {query.count === 1 ? "vez" : "veces"}
                </Text>
              </div>

              <button
                type="button"
                onClick={() => onAnswer(query)}
                className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white transition hover:bg-blue-700"
              >
                Escribir respuesta
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function EntriesSection({
  entries,
  onCreate,
  onEdit,
  onToggle,
  onRemove,
}: {
  entries: KnowledgeEntry[];
  onCreate: () => void;
  onEdit: (entry: KnowledgeEntry) => void;
  onToggle: (entry: KnowledgeEntry) => void;
  onRemove: (entry: KnowledgeEntry) => void;
}) {
  return (
    <section className="rounded-xl border bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b bg-gray-50 px-4 py-3">
        <div>
          <Title size="sm">Respuestas enseñadas</Title>
          <Text size="sm" className="text-gray-500">
            Las más usadas primero.
          </Text>
        </div>

        <button
          type="button"
          onClick={onCreate}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white transition hover:bg-blue-700"
        >
          <FiPlus /> Nueva
        </button>
      </div>

      {entries.length ? (
        <ul className="divide-y">
          {entries.map((entry) => (
            <li key={entry.id} className="px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Text
                    size="sm"
                    className={`break-words font-medium ${
                      entry.active ? "text-gray-800" : "text-gray-400"
                    }`}
                  >
                    {entry.question}
                  </Text>

                  <Text size="sm" className="break-words text-gray-600">
                    {entry.answer}
                  </Text>

                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {/* Una entrada con cero usos después de unas semanas está
                        escrita con palabras que nadie emplea. Se arregla
                        añadiéndole otras formas de preguntar, no reescribiendo
                        la respuesta. */}
                    <Text size="sm" className="text-gray-400">
                      {entry.hits === 0
                        ? "Todavía no la ha usado"
                        : `Usada ${entry.hits} ${
                            entry.hits === 1 ? "vez" : "veces"
                          }`}
                    </Text>

                    {entry.aliases?.length ? (
                      <Text size="sm" className="text-gray-400">
                        · {entry.aliases.length} forma
                        {entry.aliases.length === 1 ? "" : "s"} más de
                        preguntarla
                      </Text>
                    ) : null}

                    {entry.roles?.length ? (
                      <Text size="sm" className="text-amber-600">
                        · Solo para {entry.roles.join(", ")}
                      </Text>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onToggle(entry)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs transition ${
                      entry.active
                        ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                    title={
                      entry.active
                        ? "El asistente la está respondiendo"
                        : "Apagada: no se responde"
                    }
                  >
                    {entry.active ? "Activa" : "Apagada"}
                  </button>

                  <button
                    type="button"
                    onClick={() => onEdit(entry)}
                    aria-label="Editar"
                    className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
                  >
                    <FiEdit2 />
                  </button>

                  <button
                    type="button"
                    onClick={() => onRemove(entry)}
                    aria-label="Eliminar"
                    className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <Text className="px-4 py-8 text-center text-gray-500">
          Todavía no le has enseñado nada. Empieza por lo que más te preguntan.
        </Text>
      )}
    </section>
  );
}
