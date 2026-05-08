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
    <form
      key={language}
      onSubmit={handleSubmit}
      className="flex flex-col gap-5"
    >
      {/* Input */}
      <div className="space-y-2">
        <Text size="sm" className="text-white/80 font-medium">
          Correo electrónico
        </Text>

        <div
          className="
            rounded-2xl
            border
            border-white/10
            bg-white/[0.04]
            backdrop-blur-xl
            transition-all
            duration-300
            focus-within:border-cyan-400/40
            focus-within:shadow-[0_0_20px_rgba(34,211,238,0.15)]
          "
        >
          <InputField
            placeholder={t("correo")}
            inputSize="full"
            rounded="md"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
              bg-transparent
              border-0
              text-white
              placeholder:text-white/40
              px-4
              py-3
            "
          />
        </div>

        {error && (
          <Text colVariant="danger" size="xs" className="pl-1">
            {error}
          </Text>
        )}
      </div>

      {/* Botón principal */}
      <Button
        type="submit"
        translate="yes"
        tKey={t("cambiar")}
        size="full"
        colVariant="success"
      >
        <span className="relative z-10">Recuperar contraseña</span>

        <div
          className="
            absolute
            inset-0
            bg-white/10
            opacity-0
            transition-opacity
            duration-300
            hover:opacity-100
          "
        />
      </Button>

      <AlertFlag />

      {/* Divider */}
      <div className="relative flex items-center justify-center py-2">
        <div className="absolute w-full border-t border-white/10" />

        <span
          className="
            relative
            z-10
            bg-[#0b1120]
            px-4
            text-xs
            uppercase
            tracking-[0.2em]
            text-white/40
          "
        >
          Accesos rápidos
        </span>
      </div>

      {/* Botones secundarios */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button
          size="sm"
          onClick={() => router.push(route.complexes)}
          className="
            rounded-2xl
            border
            border-white/10
            bg-white/[0.04]
            text-white/80
            backdrop-blur-xl
            transition-all
            duration-300
            hover:bg-cyan-500/10
            hover:border-cyan-400/30
            hover:text-cyan-300
          "
        >
          SmartPH
        </Button>

        <Button
          size="sm"
          onClick={() => router.push(route.registers)}
          className="
            rounded-2xl
            border
            border-white/10
            bg-white/[0.04]
            text-white/80
            backdrop-blur-xl
            transition-all
            duration-300
            hover:bg-violet-500/10
            hover:border-violet-400/30
            hover:text-violet-300
          "
        >
          Regístrate
        </Button>

        <Button
          size="sm"
          onClick={() => router.push(route.registerComplex)}
          className="
            rounded-2xl
            border
            border-white/10
            bg-white/[0.04]
            text-white/80
            backdrop-blur-xl
            transition-all
            duration-300
            hover:bg-emerald-500/10
            hover:border-emerald-400/30
            hover:text-emerald-300
          "
        >
          Registrar conjunto
        </Button>
      </div>
    </form>
  );
}
