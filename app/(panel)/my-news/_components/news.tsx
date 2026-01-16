"use client";

import React, { useState } from "react";
import Form from "./form";
import { Title, Tooltip } from "complexes-next-components";
import { CiViewTable } from "react-icons/ci";
import { ImSpinner9 } from "react-icons/im";

import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";

export default function News() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleNavigate = () => {
    setLoading(true);
    router.push(route.news);
  };

  return (
    <div key={language}>
      <div className="w-full gap-5 flex justify-between mr-4 bg-cyan-800 shadow-lg opacity-80 p-2 rounded-md">
        <div
          className={`cursor-pointer flex items-center justify-center w-10 ${
            loading ? "pointer-events-none opacity-60" : ""
          }`}
          onClick={handleNavigate}
        >
          {loading ? (
            <ImSpinner9 className="animate-spin text-lg text-white" />
          ) : (
            <Tooltip
              content="Noticias agregadas"
              tKey={t("noticiasAgregadas")}
              className="bg-gray-200"
              position="right"
            >
              <div className="bg-white/20 p-2 rounded-full cursor-pointer">
                <CiViewTable color="white" size={34} />
              </div>
            </Tooltip>
          )}
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
