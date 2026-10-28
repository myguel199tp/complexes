"use client";

import React, { useState } from "react";
import Form from "./form";
import { CiViewTable } from "react-icons/ci";
import { ImSpinner9 } from "react-icons/im";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { HeaderAction } from "@/app/components/header";
import { FaCogs } from "react-icons/fa";
import PackagesPanel from "@/app/components/content-quota/packages-panel";

export interface PackageType {
  id: string;
  name: string;
  module: string;
  maxItems: number;
  canHighlight: boolean;
  prioritySearch: boolean;
  price: number;
  durationDays: number;
}

export default function News() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleNavigate = () => {
    setLoading(true);
    router.push(route.mynews);
  };

  return (
    <div key={language} className="relative">
      <HeaderAction
        title={t("mynoticia")}
        tooltip={t("noticiasAgregadas")}
        onClick={handleNavigate}
        icon={
          loading ? (
            <ImSpinner9 className="animate-spin text-white text-xl" />
          ) : (
            <CiViewTable color="white" size={34} />
          )
        }
        iconc={
          <div
            onClick={() => setShowInfo((prev) => !prev)}
            className="cursor-pointer"
          >
            <FaCogs color="white" size={22} />
          </div>
        }
        idicative={t("noticiasAgregadas")}
      />

      <div className="w-full">
        <Form onBuyPackages={() => setShowInfo(true)} />
      </div>

      {showInfo && <PackagesPanel module="news" onClose={() => setShowInfo(false)} />}
    </div>
  );
}
