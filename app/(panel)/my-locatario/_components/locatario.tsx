"use client";
import React from "react";
import { Title, Tooltip } from "complexes-next-components";
import { FaTableList } from "react-icons/fa6";
import { useTranslation } from "react-i18next";
import { route } from "@/app/_domain/constants/routes";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/hooks/useLanguage";
import Form from "./form";

export default function Locatario() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  return (
    <div key={language}>
      <div className="w-full gap-5 flex justify-between mr-4 bg-cyan-800 shadow-lg opacity-80 p-2 rounded-md">
        <div className="cursor-pointer">
          <Tooltip
            content={t("usuariosAgregados")}
            className="cursor-pointer bg-gray-200"
            position="right"
          >
            <FaTableList
              color="white"
              size={30}
              onClick={() => {
                router.push(route.user);
              }}
            />
          </Tooltip>
        </div>
        <Title
          size="sm"
          font="bold"
          className="text-white"
          translate="yes"
          tKey={t("agregarUsuario")}
        >
          Agregar usuario
        </Title>
      </div>
      <Form />
    </div>
  );
}
