"use client";

import React, { useState } from "react";
import { Button, InputField, SelectField, Text } from "complexes-next-components";
import { visitTypeOptions } from "@/app/(panel)/my-citofonia/components/formulario/constants";
import { useCreateAccessPass } from "./access-pass-mutations";

/** Vigencias que cubren el 95% de los casos sin hacer pensar al residente. */
const DURATIONS = [
  { label: "4 horas", value: "4" },
  { label: "12 horas", value: "12" },
  { label: "24 horas", value: "24" },
  { label: "3 días", value: "72" },
  { label: "1 semana", value: "168" },
  { label: "1 mes", value: "720" },
];

const PASS_TYPES = [
  { label: "Visita puntual (un solo ingreso)", value: "VISIT" },
  { label: "Recurrente (empleada, conductor…)", value: "RECURRING" },
];

export function AccessPassForm({ onCreated }: { onCreated?: () => void }) {
  const [visitorName, setVisitorName] = useState("");
  const [visitorDocument, setVisitorDocument] = useState("");
  const [plaque, setPlaque] = useState("");
  const [visitType, setVisitType] = useState("VISITOR");
  const [type, setType] = useState("VISIT");
  const [hours, setHours] = useState("24");
  const [error, setError] = useState<string | null>(null);

  const mutation = useCreateAccessPass();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!visitorName.trim()) {
      setError("Escribe el nombre de quien va a entrar");
      return;
    }

    setError(null);

    const validTo = new Date(
      Date.now() + Number(hours) * 60 * 60 * 1000,
    ).toISOString();

    mutation.mutate(
      {
        visitorName: visitorName.trim(),
        visitorDocument: visitorDocument.trim() || undefined,
        plaque: plaque.trim() || undefined,
        visitType,
        type: type as "VISIT" | "RECURRING",
        validTo,
      },
      {
        onSuccess: () => {
          setVisitorName("");
          setVisitorDocument("");
          setPlaque("");
          onCreated?.();
        },
      },
    );
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <Text size="xs" font="bold" className="text-gray-400 uppercase tracking-wide">
        Nuevo pase
      </Text>

      <InputField
        regexType="letters"
        placeholder="Nombre de quien va a entrar"
        helpText="Nombre del visitante"
        sizeHelp="xs"
        inputSize="sm"
        rounded="md"
        value={visitorName}
        onChange={(e) => setVisitorName(e.target.value)}
      />

      <InputField
        regexType="alphanumeric"
        placeholder="Documento (opcional)"
        helpText="Documento"
        sizeHelp="xs"
        inputSize="sm"
        rounded="md"
        value={visitorDocument}
        onChange={(e) => setVisitorDocument(e.target.value)}
      />

      <InputField
        regexType="alphanumeric"
        placeholder="Placa del vehículo (opcional)"
        helpText="Placa"
        sizeHelp="xs"
        inputSize="sm"
        rounded="md"
        value={plaque}
        onChange={(e) => setPlaque(e.target.value)}
      />

      <SelectField
        helpText="Tipo de visitante"
        defaultOption="Tipo de visitante"
        sizeHelp="xs"
        inputSize="md"
        rounded="lg"
        options={visitTypeOptions}
        value={visitType}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          setVisitType(e.target.value)
        }
      />

      <SelectField
        helpText="Tipo de pase"
        defaultOption="Tipo de pase"
        sizeHelp="xs"
        inputSize="md"
        rounded="lg"
        options={PASS_TYPES}
        value={type}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          setType(e.target.value)
        }
      />

      <SelectField
        helpText="Vigencia"
        defaultOption="Vigencia"
        sizeHelp="xs"
        inputSize="md"
        rounded="lg"
        options={DURATIONS}
        value={hours}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          setHours(e.target.value)
        }
      />

      {error && (
        <Text size="xs" className="text-red-600">
          {error}
        </Text>
      )}

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Creando…" : "Generar pase"}
      </Button>
    </form>
  );
}
