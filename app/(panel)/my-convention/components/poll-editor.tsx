"use client";

import { useState } from "react";
import {
  PollResult,
  VOTE_TYPE_LABELS,
  VoteType,
} from "../services/assemblies.types";
import { FiPlus, FiX } from "react-icons/fi";
import { Button, InputField, SelectField } from "@/app/components/ui/form";

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
    <div className="space-y-4 rounded-2xl border border-cyan-200 bg-cyan-50/50 p-4 dark:border-cyan-500/30 dark:bg-slate-900/70 md:p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700 dark:text-cyan-300">
        {poll ? "Editar pregunta" : "Nueva pregunta"}
      </p>

      <div className="space-y-1">
        <InputField
          regexType="safeChars"
          helpText="Pregunta"
          sizeHelp="xs"
          inputSize="sm"
          rounded="md"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="¿Qué se somete a votación?"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <SelectField
            helpText="Tipo de mayoría"
            sizeHelp="xs"
            inputSize="sm"
            rounded="md"
            defaultOption="Tipo de mayoría"
            options={Object.values(VoteType).map((type) => ({
              value: type,
              label: VOTE_TYPE_LABELS[type],
            }))}
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
          />
        </div>

        <div className="space-y-1">
          <InputField
            regexType="number"
            type="number"
            helpText="Porcentaje requerido"
            sizeHelp="xs"
            inputSize="sm"
            rounded="md"
            min={1}
            max={100}
            value={requiredPercentage}
            disabled={voteType === VoteType.UNANIMOUS}
            onChange={(e) => setRequiredPercentage(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
          Opciones
        </p>

        {options.map((option, index) => (
          <div
            key={option.id ?? `nueva-${index}`}
            className="flex items-center gap-2"
          >
            <div className="min-w-0 flex-1">
              <InputField
                regexType="safeChars"
                inputSize="sm"
                rounded="md"
                value={option.option}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Opción ${index + 1}`}
              />
            </div>
            <Button
              type="button"
              size="sm"
              rounded="sm"
              variant="ghost"
              colVariant="danger"
              className="shrink-0 px-2"
              aria-label={`Quitar opción ${index + 1}`}
              title="Quitar opción"
              onClick={() => removeOption(index)}
              disabled={options.length <= 2}
            >
              <FiX size={16} />
            </Button>
          </div>
        ))}

        <Button
          type="button"
          size="xs"
          rounded="sm"
          variant="ghost"
          colVariant="primary"
          className="text-cyan-700 dark:text-cyan-300"
          leftIcon={<FiPlus />}
          onClick={() => setOptions((prev) => [...prev, { option: "" }])}
        >
          Añadir opción
        </Button>
      </div>

      {error && (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          {error}
        </p>
      )}

      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          size="sm"
          rounded="sm"
          variant="outline"
          className="text-slate-700 dark:text-slate-200"
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          size="sm"
          rounded="sm"
          colVariant="primary"
          loading={isPending}
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {isPending ? "Guardando..." : "Guardar"}
        </Button>
      </div>
    </div>
  );
}
