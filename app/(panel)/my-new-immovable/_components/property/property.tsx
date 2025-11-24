"use client";
import React from "react";
import Form from "./_components/form";
import { Title, Tooltip } from "complexes-next-components";
import { FaTableList } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { route } from "@/app/_domain/constants/routes";

export default function Property() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <div key={language}>
      <div className="w-full  gap-5 flex justify-between mr-4 bg-cyan-800 shadow-lg opacity-80 p-2 rounded-md">
        <div className="cursor-pointer">
          <Tooltip
            content={t("actividadesAgregadas")}
            className="cursor-pointer bg-gray-200"
            position="right"
          >
            <FaTableList
              color="white"
              size={30}
              onClick={() => {
                router.push(route.immovable);
              }}
            />
          </Tooltip>
        </div>
        <Title
          size="sm"
          font="bold"
          colVariant="on"
          translate="yes"
          tKey={t("registerinmovable")}
        >
          Registrar inmueble
        </Title>
      </div>
      <Form />
    </div>
  );
}
