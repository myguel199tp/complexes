"use client";
import React, { useState } from "react";
// import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { CiViewTable } from "react-icons/ci";
import { HeaderAction } from "@/app/components/header";
import { FaCogs } from "react-icons/fa";
import { ImSpinner9 } from "react-icons/im";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";

export default function AllExternal() {
  const router = useRouter();
  //   const { t } = useTranslation();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleNavigate = () => {
    setLoading(true);
    router.push(route.allexternal);
  };

  return (
    <div key={language}>
      <HeaderAction
        title="Registro y conección de plataforma externa"
        tooltip="Registros externos a plataforma externa"
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
        idicative="Registros externos a plataforma externa"
      />
      tabla de extenas
    </div>
  );
}
