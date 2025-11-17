"use client";
import React from "react";
import { Title, Tooltip } from "complexes-next-components";
import { FaTableList } from "react-icons/fa6";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import Form from "./form";

export default function Asembly() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  return (
    <div key={language}>
      <div className="w-full flex justify-between mr-4 bg-cyan-800 shadow-lg opacity-80 p-2 rounded-md">
        <div>
          <Tooltip
            content={t("foroAgregado")}
            className="cursor-pointer bg-gray-200"
            position="right"
          >
            <FaTableList
              color="white"
              size={30}
              onClick={() => {
                router.push(route.foro);
              }}
            />
          </Tooltip>
        </div>
        <Title size="sm" font="bold" className="text-white" translate="yes">
          Generar Asamblea
        </Title>
      </div>
      <Form />
    </div>
  );
}
