"use client";
import React from "react";
import Form from "./form";
import { Title, Tooltip } from "complexes-next-components";
import { route } from "@/app/_domain/constants/routes";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { CiViewTable } from "react-icons/ci";

export default function Certification() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  return (
    <div key={language}>
      <div className="w-full flex justify-between mr-4 bg-cyan-800 shadow-lg opacity-80 p-2 rounded-md">
        <div className="cursor-pointer">
          <Tooltip
            content={t("documentoAgregado")}
            className="cursor-pointer bg-gray-200"
            position="bottom"
          >
            <div className="bg-white/20 p-2 rounded-full cursor-pointer">
              <CiViewTable
                color="white"
                size={34}
                onClick={() => {
                  router.push(route.certification);
                }}
              />
            </div>
          </Tooltip>
        </div>
        <Title
          size="sm"
          font="bold"
          tKey={t("registroDocuemnto")}
          translate="yes"
          className="text-white"
        >
          Registro de documentos
        </Title>
      </div>
      <Form />
    </div>
  );
}
