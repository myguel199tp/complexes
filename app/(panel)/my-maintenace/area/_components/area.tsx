"use client";

import React, { useState } from "react";
import Form from "./form";
import { HeaderAction } from "@/app/components/header";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/hooks/useLanguage";
import { route } from "@/app/_domain/constants/routes";
import { ImSpinner9 } from "react-icons/im";
import { IoReturnDownBackOutline } from "react-icons/io5";
import { FaCogs } from "react-icons/fa";

export default function Area() {
  const router = useRouter();
  //  const { t } = useTranslation();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    setLoading(true);
    router.push(route.areaMaintenaceResult);
  };
  return (
    <div key={language}>
      <HeaderAction
        title="Agregar areas"
        tooltip="Areas Agregadas"
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
            <FaCogs color="white" size={22} />
          )
        }
        idicative="Areas agregadas"
      />

      <Form />
    </div>
  );
}
