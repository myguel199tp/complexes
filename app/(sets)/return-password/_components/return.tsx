"use client";
/* eslint-disable @next/next/no-img-element */
import { Title } from "complexes-next-components";
import React from "react";
import PassswordReturn from "./passsword-return";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";

export default function ReturnPass() {
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <div
      key={language}
      className="flex flex-col md:flex-row justify-center items-center gap-8 w-full min-h-screen p-6"
    >
      {/* Formulario */}
      <div className="w-full max-w-md order-1 md:order-2">
        <Title font="bold" translate="yes" tKey={t("cambiar")}>
          Recuperar contraseña
        </Title>

        <PassswordReturn />
      </div>

      {/* Imagen */}
      <img
        src="/complex.jpg"
        className="w-full max-w-sm md:max-w-md rounded-lg object-cover order-2 md:order-1"
        alt="SmartPH"
      />
    </div>
  );
}
