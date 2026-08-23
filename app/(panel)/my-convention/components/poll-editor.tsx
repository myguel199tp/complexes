"use client";

import { useState } from "react";
import {
  PollResult,
  VOTE_TYPE_LABELS,
  VoteType,
} from "../services/assemblies.types";

interface Props {
  /** Pregunta que se corrige; ausente cuando se está agregando una nueva. */
  poll?: PollResult;
  onSubmit: (payload: {
    question: string;
    voteType: VoteType;
    requiredPercentage: number;
    options: { id?: string; option: string }[];
  }) => void;
  onCancel: () => void;
  isPending?: boolean;
  error?: string | null;
}

/**
 * Editor del orden del día.
 *
 * Se usa igual para corregir una pregunta que para agregar una nueva: en la
 * reunión las dos cosas pasan en el mismo momento y por la misma razón —el
 * orden del día quedó mal—, así que separar los formularios solo obligaba a
 * mantener dos veces la misma lista de opciones.
 *
 * Las opciones existentes conservan su `id` al editarse; las que se agregan van
 * sin él. Es lo que el backend usa para saber cuál actualizar, cuál crear y
 * cuál borrar.
 */
export default function PollEditor({
  poll,
  onSubmit,
  onCancel,
  isPending,
  error,
}: Props) {
  const [question, setQuestion] = useState(poll?.question ?? "");
  const [voteType, setVoteType] = useState<VoteType>(
    poll?.voteType ?? VoteType.SIMPLE,
  );
  const [requiredPercentage, setRequiredPercentage] = useState(
    poll?.requiredPercentage ?? 50,
  );
  const [options, setOptions] = useState<{ id?: string; option: string }[]>(
    poll?.options.map((o) => ({ id: o.id, option: o.option })) ?? [
      { option: "" },
      { option: "" },
    ],
  );

  const updateOption = (index: number, value: string) => {
    setOptions((prev) =>
      prev.map((o, i) => (i === index ? { ...o, option: value } : o)),
    );
  };

  const removeOption = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const filledOptions = options
    .map((o) => ({ ...o, option: o.option.trim() }))
    .filter((o) => o.option.length > 0);

  // Las mismas dos reglas que valida el backend, para no gastar un viaje en
  // descubrir que falta el texto o que hay una sola opción.
  const canSubmit =
    question.trim().length > 0 && filledOptions.length >= 2 && !isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;

    onSubmit({
      question: question.trim(),
      voteType,
      requiredPercentage,
      options: filledOptions,
    });
  };

  return (
    <div className="border border-cyan-200 bg-cyan-50/40 rounded-lg p-4 space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">Pregunta</label>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="¿Qué se somete a votación?"
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">
            Tipo de mayoría
          </label>
          <select
            value={voteType}
            onChange={(e) => {
              const next = e.target.value as VoteType;
              setVoteType(next);

              // La unanimidad no admite otro umbral, y quien cambia de tipo
              // espera el porcentaje del tipo nuevo, no el que había quedado.
              if (next === VoteType.UNANIMOUS) setRequiredPercentage(100);
              else if (next === VoteType.QUALIFIED) setRequiredPercentage(70);
              else setRequiredPercentage(50);
            }}
            className="w-full border rounded-md px-3 py-2 text-sm bg-white"
          >
            {Object.values(VoteType).map((type) => (
              <option key={type} value={type}>
                {VOTE_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">
            Porcentaje requerido
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={requiredPercentage}
            disabled={voteType === VoteType.UNANIMOUS}
            onChange={(e) => setRequiredPercentage(Number(e.target.value))}
            className="w-full border rounded-md px-3 py-2 text-sm disabled:bg-gray-100"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium text-gray-600">Opciones</label>

        {options.map((option, index) => (
          <div key={option.id ?? `nueva-${index}`} className="flex gap-2">
            <input
              value={option.option}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Opción ${index + 1}`}
              className="flex-1 border rounded-md px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => removeOption(index)}
              disabled={options.length <= 2}
              className="px-3 rounded-md border text-sm text-red-600 disabled:opacity-40"
            >
              Quitar
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setOptions((prev) => [...prev, { option: "" }])}
          className="text-xs text-cyan-700 hover:underline"
        >
          + Añadir opción
        </button>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm rounded-lg border"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="px-4 py-2 text-sm rounded-lg bg-cyan-600 text-white disabled:opacity-50"
        >
          {isPending ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}
