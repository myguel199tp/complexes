"use client";
import React from "react";
import Form from "./form";
import { Title, Tooltip } from "complexes-next-components";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { CiViewTable } from "react-icons/ci";

export default function Activity() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  return (
    <div
      key={language}
      className="flex flex-col w-full min-h-screen p-4 box-border"
    >
      <div className="gap-2 flex justify-between items-center bg-cyan-800 shadow-lg opacity-80 p-2 rounded-md w-full">
        <div className="cursor-pointer">
          <Tooltip
            content={t("actividadesAgregadas")}
            className="bg-gray-200"
            position="right"
          >
            <div className="bg-white/20 p-2 rounded-full cursor-pointer">
              <CiViewTable
                color="white"
                size={34}
                onClick={() => router.push(route.activity)}
              />
            </div>
          </Tooltip>
        </div>
        <Title
          size="sm"
          font="bold"
          colVariant="on"
          translate="yes"
          tKey={t("myActividad")}
        >
          Agregar Actividad
        </Title>
      </div>
      <div className="mt-4 w-full max-w-7xl">
        <Form />
      </div>
    </div>
  );
}
