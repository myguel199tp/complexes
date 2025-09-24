"use client";
import React from "react";
import Form from "./form";
import { FaTableList } from "react-icons/fa6";
import { Title, Tooltip } from "complexes-next-components";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";

export default function Activity() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  return (
    <div key={language}>
      <div className="w-full mt-6  gap-5 flex justify-between mr-4 bg-cyan-800 shadow-lg opacity-80 p-2 rounded-md">
        <div>
          <Tooltip
            content={t("actividadesAgregadas")}
            className="cursor-pointer"
            position="right"
          >
            <FaTableList
              color="white"
              size={50}
              onClick={() => {
                router.push(route.activity);
              }}
            />
          </Tooltip>
        </div>
        <Title
          size="md"
          font="bold"
          colVariant="on"
          translate="yes"
          tKey={t("myActividad")}
        >
          Agregar Actividad
        </Title>
      </div>
      <Form />
    </div>
  );
}
