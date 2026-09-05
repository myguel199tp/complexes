"use client";

import React, { useState } from "react";
import { Button, InputField, SelectField } from "complexes-next-components";

import OtpStep from "./otpStep";

export type BankFormData = {
  bankName: string;
  accountNumber: string;
  accountType: "SAVINGS" | "CHECKING";
};

type Props = {
  conjuntoId: string;
  onSuccess: () => void;
  /** Texto del botón que dispara el envío del OTP. */
  submitLabel?: string;
  onCancel?: () => void;
};

/**
 * Alta de una cuenta bancaria del conjunto: datos + verificación OTP.
 *
 * Se usa tanto para la primera cuenta (bloqueante, en /my-fees) como para las
 * siguientes desde el desplegable de la tabla, por eso vive aparte.
 */
export default function BankAccountForm({
  conjuntoId,
  onSuccess,
  submitLabel = "Continuar",
  onCancel,
}: Props) {
  const [formData, setFormData] = useState<BankFormData | null>(null);
  const [accountType, setAccountType] =
    useState<BankFormData["accountType"]>("SAVINGS");

  const handleSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = new FormData(e.currentTarget);

    setFormData({
      bankName: String(form.get("bankName")).trim(),
      accountNumber: String(form.get("accountNumber")).trim(),
      accountType,
    });
  };

  if (formData) {
    return (
      <OtpStep
        conjuntoId={conjuntoId}
        formData={formData}
        onSuccess={onSuccess}
        onBack={() => setFormData(null)}
      />
    );
  }

  return (
    <form onSubmit={handleSubmitForm} className="flex flex-col gap-3">
      <InputField
        regexType="safeChars"
        name="bankName"
        helpText="Nombre del banco"
        sizeHelp="xs"
        inputSize="md"
        rounded="md"
        placeholder="Nombre del banco"
        required
      />

      <InputField
        regexType="number"
        name="accountNumber"
        helpText="Número de cuenta"
        sizeHelp="xs"
        inputSize="md"
        rounded="md"
        placeholder="Número de cuenta"
        required
      />

      <SelectField
        name="accountType"
        helpText="Tipo de cuenta"
        sizeHelp="xs"
        inputSize="md"
        rounded="md"
        defaultOption="Tipo de cuenta"
        options={[
          { value: "SAVINGS", label: "Ahorros" },
          { value: "CHECKING", label: "Corriente" },
        ]}
        value={accountType}
        onChange={(e) =>
          setAccountType(e.target.value as BankFormData["accountType"])
        }
        required
      />

      <div className="flex gap-2">
        {onCancel && (
          <Button
            type="button"
            colVariant="default"
            rounded="md"
            size="full"
            onClick={onCancel}
          >
            Cancelar
          </Button>
        )}

        <Button colVariant="success" size="full">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
