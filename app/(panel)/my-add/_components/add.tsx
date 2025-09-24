"use client";
import { Title, Tooltip } from "complexes-next-components";
import React from "react";
import { FaTableList } from "react-icons/fa6";
import Form from "./form";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";

export default function Add() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  return (
    <div key={language}>
      <div className="w-full mt-6  gap-5 flex justify-between mr-4 bg-cyan-800 shadow-lg opacity-80 p-2 rounded-md">
        <div>
          <Tooltip
            content={t("anuncioregistrado")}
            className="cursor-pointer bg-gray-200"
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
