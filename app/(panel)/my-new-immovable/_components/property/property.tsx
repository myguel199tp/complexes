"use client";
import React from "react";
import Form from "./_components/form";
import { Title, Tooltip } from "complexes-next-components";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { route } from "@/app/_domain/constants/routes";
import { CiViewTable } from "react-icons/ci";

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
            <div className="bg-white/20 p-2 rounded-full cursor-pointer">
              <CiViewTable
                color="white"
                size={34}
                onClick={() => {
                  router.push(route.immovable);
                }}
              />
            </div>
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
