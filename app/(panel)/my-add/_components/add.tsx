"use client";
import { Title, Tooltip } from "complexes-next-components";
import React from "react";
import Form from "./form";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { CiViewTable } from "react-icons/ci";

export default function Add() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  return (
    <div key={language}>
      <div className="w-full flex justify-between mr-4 bg-cyan-800 shadow-lg opacity-80 p-2 rounded-md">
        <div className="cursor-pointer">
          <Tooltip
            content={t("anuncioregistrado")}
            className="cursor-pointer bg-gray-200"
            position="right"
          >
            <div className="bg-white/20 p-2 rounded-full cursor-pointer">
              <CiViewTable
                color="white"
                size={34}
                onClick={() => {
                  router.push(route.add);
                }}
              />
            </div>
          </Tooltip>
        </div>
        <Title
          size="sm"
          font="bold"
          className="text-white"
          translate="yes"
          tKey={t("registraranuncio")}
        >
          Registrar anuncio
        </Title>
      </div>

      <Form />
    </div>
  );
}
