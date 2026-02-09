"use client";

import React, { useState } from "react";

import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { HeaderAction } from "@/app/components/header";
import { FaCogs } from "react-icons/fa";
import { Text } from "complexes-next-components";
import Social from "./social";

export default function AllSocial() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div key={language}>
      <HeaderAction
        title="Generar reserva"
        tooltip={t("noticiasAgregadas")}
        iconc={
          <div
            onClick={() => setShowInfo((prev) => !prev)}
            className="cursor-pointer"
          >
            <FaCogs color="white" size={34} />
          </div>
        }
      />
      <div className="w-full flex gap-2">
        <div className={showInfo ? "flex-1" : "w-full"}>
          <Social />
        </div>

        {showInfo && (
          <div
            className="
              flex flex-col gap-3 p-3 shadow-lg border rounded-lg
              w-full md:w-[220px]
              max-h-[300px] md:max-h-[500px]
              overflow-y-auto scrollbar-hide
              mt-2
            "
          >
            <Text size="xs" font="bold">
              ¿Qué puedes hacer?
            </Text>
            <Text size="xs">
              puedes seleccionar la actividad que eseas realizar y separar tu
              espacio de forma segura y rapida
            </Text>

            <Text size="xs">La reserva quedara lista una ves generada</Text>
          </div>
        )}
      </div>
    </div>
  );
}
