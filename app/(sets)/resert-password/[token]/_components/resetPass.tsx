"use client";
/* eslint-disable @next/next/no-img-element */
import { Title } from "complexes-next-components";
import React from "react";
import ResetPassword from "./resert-password";
import { useTranslation } from "react-i18next";

export default function ResetPass() {
  const { t } = useTranslation();
  return (
    <div className="flex justify-center items-center gap-4 w-full h-full">
      <img src="/complex.jpg" className="rounded-lg" alt="Complexes" />
      <div className="flex justify-center items-center">
        <div>
          <Title font="bold" translate="yes" tKey={t("cambiar")}>
            Recuperar contraseña
          </Title>
          <ResetPassword />
        </div>
      </div>
    </div>
  );
}
