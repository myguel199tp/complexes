// components/PasswordReturn.tsx
"use client";

import React, { useState } from "react";
import { route } from "@/app/_domain/constants/routes";
import { InputField, Button, Text } from "complexes-next-components";
import { useRouter } from "next/navigation";
import { useReturnMutationForm } from "./use-return-mutation";
import { AlertFlag } from "@/app/components/alertFalg";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";

export default function PasswordReturn() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const { mutate } = useReturnMutationForm();
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Por favor ingresa un correo electrónico válido.");
      return;
    }

    setError("");
    mutate(email);
  };

  return (
    <form key={language} onSubmit={handleSubmit}>
      <InputField
        placeholder={t("correo")}
        inputSize="full"
        rounded="md"
        className="mt-2"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {error && <Text className="text-red-500 text-sm mt-1">{error}</Text>}
      <Button
        type="submit"
        colVariant="warning"
        className="mt-4"
        translate="yes"
        tKey={t("cambiar")}
      >
        Recuperar contraseña
      </Button>

      <div className="flex justify-center gap-4 mt-4">
        <Button size="sm" onClick={() => router.push(route.complexes)}>
          Complexes
        </Button>
        <Button size="sm" onClick={() => router.push(route.registers)}>
          Regístrate
        </Button>
        <Button size="sm" onClick={() => router.push(route.registerComplex)}>
          Registrar conjunto
        </Button>
      </div>
      <AlertFlag />
    </form>
  );
}
