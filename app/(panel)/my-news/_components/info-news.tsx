"use client";

import React, { useState } from "react";
import Tables from "./table";
import { ImSpinner9 } from "react-icons/im";

import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { IoReturnDownBackOutline } from "react-icons/io5";
import { HeaderAction } from "@/app/components/header";
import { FaCogs } from "react-icons/fa";

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
      <HeaderAction
        title={t("noticiasAgregadas")}
        tooltip={t("mynoticia")}
        onClick={handleBack}
        icon={
          loading ? (
            <ImSpinner9 className="animate-spin text-white text-xl" />
          ) : (
            <IoReturnDownBackOutline color="white" size={34} />
          )
        }
        iconc={
          loading ? (
            <ImSpinner9 className="animate-spin text-white text-xl" />
          ) : (
            <FaCogs color="white" size={34} />
          )
        }
      />
      <Tables />
    </div>
  );
}
