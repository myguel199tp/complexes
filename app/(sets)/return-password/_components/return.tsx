"use client";
/* eslint-disable @next/next/no-img-element */

import { Title, Text } from "complexes-next-components";
import React from "react";
import PassswordReturn from "./passsword-return";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { AlertFlag } from "@/app/components/alertFalg";

export default function ReturnPass() {
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <div
      key={language}
      className="
        relative
        min-h-screen
        overflow-hidden
        bg-[#050816]
        px-4
        py-10
        md:px-10
        flex
        items-center
        justify-center
      "
    >
      {/* Glow Backgrounds */}
      <div className="absolute top-0 left-0 w-[350px] h-[350px] bg-cyan-500/20 blur-3xl rounded-full" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-violet-500/20 blur-3xl rounded-full" />

      <div
        className="
          relative
          z-10
          w-full
          max-w-6xl
          grid
          grid-cols-1
          md:grid-cols-2
          overflow-hidden
          rounded-[32px]
          border
          border-white/10
          bg-white/5
          backdrop-blur-2xl
          shadow-[0_0_80px_rgba(0,255,255,0.08)]
        "
      >
        {/* Imagen */}
        <div className="relative hidden md:flex items-center justify-center bg-black/20 p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-violet-500/10" />

          <img
            src="/complex.jpg"
            className="
              p-5
              relative
              z-10
              h-full
              max-h-[700px]
              w-full
              object-cover
              rounded-3xl
              shadow-2xl
            "
            alt="SmartPH"
          />
        </div>

        {/* Formulario */}
        <div
          className="
            flex
            flex-col
            justify-center
            p-8
            md:p-14
          "
        >
          <div className="mb-8">
            <div
              className="
                inline-flex
                items-center
                rounded-full
                border
                border-cyan-400/20
                bg-cyan-400/10
                px-4
                py-1
                text-cyan-300
                text-sm
                font-medium
                mb-4
              "
            >
              SmartPH Security
            </div>
            <AlertFlag />

            <Title
              font="bold"
              translate="yes"
              colVariant="on"
              size="sm"
              tKey={t("cambiar")}
            >
              Recuperar o cambiar contraseña
            </Title>

            <Text className="mt-3 text-white/60 text-sm leading-relaxed">
              Ingresa tu información para recuperar el acceso a tu cuenta de
              manera rápida y segura.
            </Text>
          </div>

          <div
            className="
              rounded-3xl
              border
              border-white/10
              bg-white/[0.03]
              p-6
              backdrop-blur-xl
            "
          >
            <PassswordReturn />
          </div>
        </div>
      </div>
    </div>
  );
}
