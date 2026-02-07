"use client";
import React, { useState } from "react";
import Form from "./form";
// import { useTranslation } from "react-i18next";
import { route } from "@/app/_domain/constants/routes";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/hooks/useLanguage";
import { CiViewTable } from "react-icons/ci";
import { HeaderAction } from "@/app/components/header";
import { useTranslation } from "react-i18next";
import { ImSpinner9 } from "react-icons/im";
import { FaCogs } from "react-icons/fa";

export default function NewRegisterWork() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleNavigate = () => {
    setLoading(true);
    router.push(route.user);
  };
  return (
    <div key={language}>
      <HeaderAction
        title={"Agregar colaborador"}
        tooltip={t("usuariosAgregados")}
        onClick={handleNavigate}
        icon={
          loading ? (
            <ImSpinner9 className="animate-spin text-white text-xl" />
          ) : (
            <CiViewTable color="white" size={34} />
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
      <Form />
    </div>
  );
}
