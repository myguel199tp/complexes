"use client";
import React from "react";
import { FaTableList } from "react-icons/fa6";
import Form from "./form";
import { Title, Tooltip } from "complexes-next-components";
import { route } from "@/app/_domain/constants/routes";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";

export default function Certification() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  return (
    <div key={language}>
      <div className="w-full mt-6  gap-5 flex justify-between mr-4 bg-cyan-800 shadow-lg opacity-80 p-2 rounded-md">
        <div>
          <Tooltip
            content={t("documentoAgregado")}
            className="cursor-pointer bg-gray-200"
            position="bottom"
          >
            <FaTableList
              color="white"
              size={50}
              onClick={() => {
                router.push(route.certification);
              }}
            />
          </Tooltip>
        </div>
        <Title
          size="md"
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
