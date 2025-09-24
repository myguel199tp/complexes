"use client";
import React from "react";
import Form from "./formulario/form";
import { FaTableList } from "react-icons/fa6";
import { Title, Tooltip } from "complexes-next-components";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";

export default function Citofonie() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  return (
    <div key={language}>
      <div className="w-full mt-6  gap-5 flex justify-between mr-4 bg-cyan-800 shadow-lg opacity-80 p-2 rounded-md">
        <div>
          <Tooltip
            content={t("visitasAgregadas")}
            className="cursor-pointer bg-gray-200"
            position="right"
          >
            <FaTableList
              color="white"
              size={50}
              onClick={() => {
                router.push(route.citofonia);
              }}
            />
          </Tooltip>
        </div>
        <Title
          size="md"
          font="bold"
          className="text-white"
          tKey={t("registrarVisitante")}
        >
          Registrar visitante
        </Title>
      </div>
      <Form />
    </div>
  );
}
