"use client";
/* eslint-disable @next/next/no-img-element */
import { Title } from "complexes-next-components";
import React from "react";
import PassswordReturn from "./passsword-return";
import { useTranslation } from "react-i18next";

export default function ReturnPass() {
  const { t } = useTranslation();
  return (
    <div className="flex justify-center items-center gap-4 w-full h-full">
      <img src="/complex.jpg" className="rounded-lg" alt="Complexes" />
      <div className="flex justify-center items-center">
        <div>
          <Title font="bold" translate="yes" tKey={t("cambiar")}>
            Recuperar contraseña
          </Title>
          <PassswordReturn />
        </div>
      </div>
    </div>
  );
}
