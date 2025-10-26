"use client";
import React from "react";
import Form from "./form";
import { Title, Tooltip } from "complexes-next-components";
import { FaTableList } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";

export default function News() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <div key={language}>
      <div className="w-full gap-5 flex justify-between mr-4 bg-cyan-800 shadow-lg opacity-80 p-2 rounded-md">
        <div className="cursor-pointer">
          <Tooltip
            content="Noticias agregadas"
            className="bg-gray-200"
            position="right"
          >
            <FaTableList
              color="white"
              size={30}
              onClick={() => {
                router.push(route.news);
              }}
            />
          </Tooltip>
        </div>
        <Title
          tKey={t("mynoticia")}
          translate="yes"
          size="sm"
          font="bold"
          className="text-white"
        >
          Agregar noticia
        </Title>
      </div>
      <Form />
    </div>
  );
}
