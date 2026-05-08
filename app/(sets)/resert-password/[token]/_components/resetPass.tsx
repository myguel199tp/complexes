"use client";
/* eslint-disable @next/next/no-img-element */

import { Title, Text } from "complexes-next-components";
import React from "react";
import ResetPassword from "./resert-password";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { ShieldCheck, LockKeyhole } from "lucide-react";

export default function ResetPass() {
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
        flex
        items-center
        justify-center
        px-4
        py-10
      "
    >
      {/* Background Glow */}
      <div className="absolute top-[-120px] left-[-120px] w-[300px] h-[300px] bg-emerald-500/20 blur-3xl rounded-full" />
      <div className="absolute bottom-[-120px] right-[-120px] w-[300px] h-[300px] bg-cyan-500/20 blur-3xl rounded-full" />

      <div
        className="
          relative
          z-10
          w-full
          max-w-6xl
          grid
          lg:grid-cols-2
          rounded-[32px]
          overflow-hidden
          border
          border-white/10
          bg-white/5
          backdrop-blur-2xl
          shadow-2xl
        "
      >
        {/* Left Side */}
        <div className="relative hidden lg:flex items-center justify-center p-10 bg-white/[0.03]">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10" />

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="relative">
              <img
                src="/complex.jpg"
                className="
                  w-[340px]
                  rounded-[28px]
                  border
                  border-white/10
                  shadow-[0_20px_80px_rgba(0,0,0,0.45)]
                "
                alt="SmartPH"
              />

              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    px-4
                    py-2
                    rounded-full
                    border
                    border-emerald-400/20
                    bg-emerald-500/10
                    backdrop-blur-xl
                    text-emerald-300
                    text-sm
                  "
                >
                  <ShieldCheck className="w-4 h-4" />
                  Seguridad protegida
                </div>
              </div>
            </div>

            <div className="mt-12 space-y-3">
              <Title font="bold" size="sm" className="text-white">
                SmartPH
              </Title>

              <Text className="text-gray-400 max-w-md">
                Recupera el acceso a tu cuenta de manera segura y moderna.
              </Text>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <div
                className="
                  w-16
                  h-16
                  rounded-2xl
                  bg-emerald-500/10
                  border
                  border-emerald-500/20
                  flex
                  items-center
                  justify-center
                  mb-5
                "
              >
                <LockKeyhole className="w-8 h-8 text-emerald-400" />
              </div>

              <Title
                font="bold"
                size="sm"
                translate="yes"
                tKey={t("cambiar")}
                className="text-white"
              >
                Recuperar contraseña
              </Title>

              <Text className="text-gray-400 mt-2">
                Ingresa una nueva contraseña para continuar.
              </Text>
            </div>

            <ResetPassword />
          </div>
        </div>
      </div>
    </div>
  );
}
