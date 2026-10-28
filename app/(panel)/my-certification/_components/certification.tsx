"use client";
import React, { useState } from "react";
import Form from "./form";
import { route } from "@/app/_domain/constants/routes";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { CiViewTable } from "react-icons/ci";
import { HeaderAction } from "@/app/components/header";
import { ImSpinner9 } from "react-icons/im";
import { FaCogs } from "react-icons/fa";
import PackagesPanel from "@/app/components/content-quota/packages-panel";

export default function Certification() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleNavigate = () => {
    setLoading(true);
    router.push(route.mycertification);
  };
  return (
    <div key={language} className="relative">
      <HeaderAction
        title={t("registroDocuemnto")}
        tooltip={t("documentoAgregado")}
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
        idicative={t("documentoAgregado")}
      />
      <div className="w-full">
        <Form onBuyPackages={() => setShowInfo(true)} />
      </div>

      {showInfo && (
        <PackagesPanel module="documents" onClose={() => setShowInfo(false)} />
      )}
    </div>
  );
}
