"use client";

import React, { useState } from "react";
import { Title, Tooltip } from "complexes-next-components";
import Tables from "./table";
import { ImSpinner9 } from "react-icons/im";

import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { IoReturnDownBackOutline } from "react-icons/io5";

export default function InfoNews() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    setLoading(true);
    router.push(route.mynews);
  };

  return (
    <div key={language}>
      <div className="w-full gap-5 flex justify-between mr-4 bg-cyan-800 shadow-lg opacity-80 p-2 rounded-md">
        <div
          className={`cursor-pointer flex items-center justify-center w-10 ${
            loading ? "pointer-events-none opacity-60" : ""
          }`}
          onClick={handleBack}
        >
          {loading ? (
            <ImSpinner9 className="animate-spin text-lg text-white" />
          ) : (
            <Tooltip
              content={t("mynoticia")}
              className="bg-gray-200"
              position="right"
            >
              <div className="bg-white/20 p-2 rounded-full cursor-pointer">
                <IoReturnDownBackOutline color="white" size={30} />
              </div>
            </Tooltip>
          )}
        </div>

        <Title
          size="sm"
          font="bold"
          colVariant="on"
          tKey={t("noticiasAgregadas")}
        >
          Noticias Agregadas
        </Title>
      </div>

      <Tables />
    </div>
  );
}
