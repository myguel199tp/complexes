"use client";
import { route } from "@/app/_domain/constants/routes";
import { useLanguage } from "@/app/hooks/useLanguage";
import React, { useState } from "react";
// import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import AllInfoPqr from "./all-info-pqr";
import { HeaderAction } from "@/app/components/header";
import { ImSpinner9 } from "react-icons/im";
import { IoReturnDownBackOutline } from "react-icons/io5";
import { FaCogs } from "react-icons/fa";

export default function Pqrinformation() {
  const router = useRouter();
  // const { t } = useTranslation();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    setLoading(true);
    router.push(route.pqr);
  };

  return (
    <div key={language}>
      <HeaderAction
        title="PQR generados"
        tooltip="PQR creados"
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

      <AllInfoPqr />
    </div>
  );
}
