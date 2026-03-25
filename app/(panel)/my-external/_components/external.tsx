"use client";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { CiViewTable } from "react-icons/ci";
import { ExternalListingForm } from "./ExternalListingForm";
import { HeaderAction } from "@/app/components/header";
import { FaCogs } from "react-icons/fa";
import { ImSpinner9 } from "react-icons/im";

export default function External() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleNavigate = () => {
    setLoading(true);
  };

  return (
    <div key={language}>
      <HeaderAction
        title="Registro y conección de plataforma externa"
        tooltip={t("actividadesAgregadas")}
        onClick={handleNavigate}
        icon={
          loading ? (
            <ImSpinner9 className="animate-spin text-white text-xl" />
          ) : (
            <CiViewTable color="white" size={34} />
          )
        }
        iconc={
          <div className="cursor-pointer">
            <FaCogs color="white" size={22} />
          </div>
        }
      />

      <ExternalListingForm />
    </div>
  );
}
