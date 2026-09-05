"use client";

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { InputField, SelectField, Text } from "complexes-next-components";

import {
  CollectionAgreement,
  CollectionAgreementService,
  CollectionFileFormat,
  CollectionProvider,
  PROVIDER_LABEL,
  ReferenceCheckDigit,
} from "../../services/collectionAgreementService";

const CHECK_DIGIT_LABEL: Record<ReferenceCheckDigit, string> = {
  [ReferenceCheckDigit.NONE]: "Sin dígito de verificación",
  [ReferenceCheckDigit.MOD_10]: "Módulo 10 (Luhn)",
  [ReferenceCheckDigit.MOD_11]: "Módulo 11",
};

const FILE_FORMAT_LABEL: Record<CollectionFileFormat, string> = {
  [CollectionFileFormat.ASOBANCARIA_2001]: "Asobancaria 2001",
  [CollectionFileFormat.ASOBANCARIA_2011]: "Asobancaria 2011",
  [CollectionFileFormat.BANCOLOMBIA]: "Formato Bancolombia",
  [CollectionFileFormat.CSV_CUSTOM]: "CSV propio",
};

const PROVIDER_OPTIONS = Object.values(CollectionProvider).map((value) => ({
  value,
  label: PROVIDER_LABEL[value],
}));

const CHECK_DIGIT_OPTIONS = Object.values(ReferenceCheckDigit).map((value) => ({
  value,
  label: CHECK_DIGIT_LABEL[value],
}));

const FILE_FORMAT_OPTIONS = [
  { value: "", label: "Sin definir" },
  ...Object.values(CollectionFileFormat).map((value) => ({
    value,
    label: FILE_FORMAT_LABEL[value],
  })),
];

type Props = {
  conjuntoId: string;
  /** Null al crear; el convenio a corregir al editar. */
  agreement: CollectionAgreement | null;
  onCancel: () => void;
  onSuccess: () => void;
};

/**
 * Alta y corrección de un convenio de recaudo.
 *
 * El formato de la referencia —prefijo, largo y dígito de verificación— se
 * bloquea en cuanto el convenio emite su primera referencia: cambiarlo después
 * le cambia el código a todas las unidades, y esas referencias ya están en los
 * recibos, en el pago programado de la app del banco del residente y del lado
 * del banco. El backend también lo rechaza; aquí se deshabilita para que no
 * parezca editable.
 */
export default function CollectionAgreementForm({
  conjuntoId,
  agreement,
  onCancel,
  onSuccess,
}: Props) {
  const [provider, setProvider] = useState<CollectionProvider>(
    agreement?.provider ?? CollectionProvider.CAJA_SOCIAL,
  );
  const [checkDigit, setCheckDigit] = useState<ReferenceCheckDigit>(
    agreement?.checkDigit ?? ReferenceCheckDigit.NONE,
  );
  const [fileFormat, setFileFormat] = useState<CollectionFileFormat | "">(
    agreement?.fileFormat ?? "",
  );
  const [error, setError] = useState<string | null>(null);

  const formatLocked = (agreement?.issuedReferences ?? 0) > 0;

  const save = useMutation({
    mutationFn: (
      data: Parameters<typeof CollectionAgreementService.create>[0],
    ) =>
      agreement
        ? CollectionAgreementService.update(agreement.id, data, conjuntoId)
        : CollectionAgreementService.create(data, conjuntoId),
    onSuccess,
    onError: (mutationError: Error) => setError(mutationError.message),
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const text = (name: string) => String(form.get(name) ?? "").trim();

    const channels = text("paymentChannels")
      .split(",")
      .map((channel) => channel.trim())
      .filter(Boolean);

    save.mutate({
      provider,
      agreementCode: text("agreementCode"),
      displayName: text("displayName") || undefined,
      instructions: text("instructions") || undefined,
      paymentUrl: text("paymentUrl") || undefined,
      paymentChannels: channels,
      fileFormat: fileFormat || undefined,
      // Congelados tras la primera emisión: no se reenvían para no chocar
      // contra la validación del backend con el mismo valor que ya tienen.
      ...(formatLocked
        ? {}
        : {
            referencePrefix: text("referencePrefix"),
            referenceLength: Number(form.get("referenceLength")),
            checkDigit,
          }),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border bg-gray-50 p-3 flex flex-col gap-3"
    >
      <div className="grid gap-3 md:grid-cols-2">
        <SelectField
          helpText="Banco o plataforma"
          sizeHelp="xs"
          inputSize="full"
          rounded="md"
          options={PROVIDER_OPTIONS}
          value={provider}
          onChange={(event) =>
            setProvider(event.target.value as CollectionProvider)
          }
        />

        <InputField
          regexType="safeChars"
          name="agreementCode"
          helpText="Código de convenio"
          sizeHelp="xs"
          inputSize="full"
          rounded="md"
          required
          defaultValue={agreement?.agreementCode ?? ""}
          placeholder="El que te asignó el banco"
        />

        <InputField
          regexType="safeChars"
          name="displayName"
          helpText="Nombre que ve el residente (opcional)"
          sizeHelp="xs"
          inputSize="full"
          rounded="md"
          defaultValue={agreement?.displayName ?? ""}
          placeholder={PROVIDER_LABEL[provider]}
        />

        <InputField
          name="paymentUrl"
          type="url"
          helpText="Enlace del portal de pago (opcional)"
          sizeHelp="xs"
          inputSize="full"
          rounded="md"
          defaultValue={agreement?.paymentUrl ?? ""}
          placeholder="https://www.mipagoamigo.com"
        />

        <InputField
          regexType="safeChars"
          name="referencePrefix"
          helpText="Prefijo de la referencia"
          sizeHelp="xs"
          inputSize="full"
          rounded="md"
          inputMode="numeric"
          pattern="[0-9]*"
          disabled={formatLocked}
          defaultValue={agreement?.referencePrefix ?? ""}
          placeholder="Solo dígitos"
        />

        <InputField
          regexType="number"
          name="referenceLength"
          type="number"
          helpText="Largo total de la referencia"
          sizeHelp="xs"
          inputSize="full"
          rounded="md"
          min={4}
          max={30}
          disabled={formatLocked}
          defaultValue={agreement?.referenceLength ?? 12}
        />

        <SelectField
          helpText="Dígito de verificación"
          sizeHelp="xs"
          inputSize="full"
          rounded="md"
          options={CHECK_DIGIT_OPTIONS}
          value={checkDigit}
          disabled={formatLocked}
          onChange={(event) =>
            setCheckDigit(event.target.value as ReferenceCheckDigit)
          }
        />

        <SelectField
          helpText="Formato del archivo de recaudo (opcional)"
          sizeHelp="xs"
          inputSize="full"
          rounded="md"
          options={FILE_FORMAT_OPTIONS}
          value={fileFormat}
          onChange={(event) =>
            setFileFormat(event.target.value as CollectionFileFormat | "")
          }
        />
      </div>

      <InputField
        regexType="safeChars"
        name="paymentChannels"
        helpText="Dónde puede pagar el residente, separado por comas"
        sizeHelp="xs"
        inputSize="full"
        rounded="md"
        defaultValue={(agreement?.paymentChannels ?? []).join(", ")}
        placeholder="Oficinas, corresponsales, PSE, app del banco"
      />

      <label className="flex flex-col gap-1">
        <Text size="xs" className="text-gray-600">
          Instrucciones adicionales (opcional)
        </Text>

        <textarea
          name="instructions"
          rows={2}
          defaultValue={agreement?.instructions ?? ""}
          className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-cyan-600"
        />
      </label>

      {formatLocked && (
        <Text size="xs" className="text-gray-500">
          El formato de la referencia está bloqueado: este convenio ya emitió{" "}
          {agreement?.issuedReferences} referencias y cambiarlo dejaría sin
          efecto las que ya tienen los residentes y el banco. Si necesitas otro
          formato, crea un convenio nuevo.
        </Text>
      )}

      {error && (
        <Text size="xs" className="rounded-md bg-red-50 p-2 text-red-700">
          {error}
        </Text>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={save.isPending}
          className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
        >
          {save.isPending ? "Guardando…" : "Guardar convenio"}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
