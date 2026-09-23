"use client";

import React, { useState } from "react";
import { Text, Title } from "complexes-next-components";

import { UserRole } from "@/app/_domain/types/jwt-payload";

export interface KnowledgeDraft {
  /** Sin id es una entrada nueva. */
  id?: string;
  question: string;
  answer: string;
  aliases: string[];
  roles: string[];
  /** De qué pregunta sin responder salió, si salió de la cola. */
  sourceQueryId?: string;
}

/**
 * Los roles que se pueden elegir para restringir una respuesta.
 *
 * No están los dieciocho del sistema: de casi todos no tiene sentido decir "esto
 * solo lo puede saber el jardinero", y una lista de dieciocho casillas convierte
 * una decisión rara en un trámite obligatorio. Están los grupos por los que sí
 * se separa la información de un conjunto.
 */
const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: UserRole.OWNER, label: "Propietarios" },
  { value: UserRole.TENANT, label: "Arrendatarios" },
  { value: UserRole.EMPLOYEE, label: "Administración" },
  { value: UserRole.ACCOUNTANT, label: "Contabilidad" },
  { value: UserRole.COMMUNITY_MANAGER, label: "Gestión de comunidad" },
  { value: UserRole.PORTER, label: "Portería" },
  { value: UserRole.MAINTENANCE, label: "Mantenimiento" },
];

/**
 * El formulario de una respuesta.
 *
 * Sale como panel sobre la pantalla y no como página aparte porque casi siempre
 * se llega desde la cola de preguntas sin responder, y perder de vista la lista
 * obligaría a volver a buscar dónde se estaba.
 */
export default function KnowledgeForm({
  draft,
  onSave,
  onCancel,
}: {
  draft: KnowledgeDraft;
  onSave: (values: KnowledgeDraft) => Promise<void>;
  onCancel: () => void;
}) {
  const [question, setQuestion] = useState(draft.question);
  const [answer, setAnswer] = useState(draft.answer);
  /**
   * Los alias se editan como texto, uno por línea.
   *
   * Es lo que la gente ya hace al escribir una lista, y evita el control de
   * etiquetas con su tecla de confirmar, que en esta pantalla solo añadiría algo
   * que aprender para guardar dos frases.
   */
  const [aliases, setAliases] = useState(draft.aliases.join("\n"));
  const [roles, setRoles] = useState<string[]>(draft.roles);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleRole = (value: string) => {
    setRoles((prev) =>
      prev.includes(value)
        ? prev.filter((role) => role !== value)
        : [...prev, value],
    );
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError(null);

    try {
      await onSave({
        ...draft,
        question: question.trim(),
        answer: answer.trim(),
        aliases: aliases
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
        roles,
      });
    } catch (err) {
      // El error se queda en el panel y no cierra nada: los mensajes útiles del
      // backend —la pregunta es muy corta, ya existe una igual— son cosas que
      // se arreglan aquí mismo, y cerrar obligaría a escribirlo todo de nuevo.
      setError(err instanceof Error ? err.message : "No se pudo guardar");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <form
        onSubmit={submit}
        className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl"
      >
        <Title size="sm">
          {draft.id ? "Editar respuesta" : "Enseñarle una respuesta"}
        </Title>

        {draft.sourceQueryId ? (
          <Text size="sm" className="mt-1 text-gray-500">
            Sale de una pregunta que no supo responder. Al guardarla, la
            pregunta deja de aparecer en la lista.
          </Text>
        ) : null}

        <label className="mt-4 block">
          <Text size="sm" className="font-medium text-gray-700">
            La pregunta, tal como la haría alguien
          </Text>
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            maxLength={200}
            required
            placeholder="¿A qué hora abre la piscina?"
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </label>

        <label className="mt-4 block">
          <Text size="sm" className="font-medium text-gray-700">
            Lo que debe responder
          </Text>
          <textarea
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            maxLength={2000}
            required
            rows={4}
            placeholder="De 6:00 a. m. a 9:00 p. m., todos los días."
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
          <Text size="sm" className="text-gray-500">
            Se responde tal cual, con estas palabras.
          </Text>
        </label>

        <label className="mt-4 block">
          <Text size="sm" className="font-medium text-gray-700">
            Otras formas de preguntar lo mismo (una por línea)
          </Text>
          <textarea
            value={aliases}
            onChange={(event) => setAliases(event.target.value)}
            rows={3}
            placeholder={"horario de la piscina\nhasta qué hora está abierta"}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
          <Text size="sm" className="text-gray-500">
            {/* Esto es lo único que sube el acierto sin tocar el sistema: el
                asistente compara palabras, así que reconoce lo que se parece a
                lo que está escrito aquí y poco más. */}
            Es lo que más ayuda: cuantas más formas, más veces la reconoce.
          </Text>
        </label>

        <fieldset className="mt-4">
          <Text size="sm" className="font-medium text-gray-700">
            ¿Quién puede recibir esta respuesta?
          </Text>
          <Text size="sm" className="text-gray-500">
            Sin marcar nada, la recibe cualquiera que use el asistente.
          </Text>

          <div className="mt-2 flex flex-wrap gap-2">
            {ROLE_OPTIONS.map((option) => {
              const selected = roles.includes(option.value);

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleRole(option.value)}
                  aria-pressed={selected}
                  className={`rounded-full border px-3 py-1.5 text-xs transition ${
                    selected
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        {error ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
