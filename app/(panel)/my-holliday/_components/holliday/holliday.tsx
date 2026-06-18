"use client";
import React, { useState } from "react";
import Form from "./_components/form";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { route } from "@/app/_domain/constants/routes";
import { CiViewTable } from "react-icons/ci";
import { HeaderAction } from "@/app/components/header";
import { FaCogs } from "react-icons/fa";
import { ImSpinner9 } from "react-icons/im";
import { Tabs } from "complexes-next-components";
import FormExternal from "./_components/form-external";

export default function Holliday() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);

  const tabs = [
    {
      tKey: "Registrar inmueble de la unidad",
      background: "primary",
      children: <Form />,
    },
    {
      tKey: "Registrar inmueble externo propio",
      background: "primary",
      children: <FormExternal />,
    },
  ];

  const handleNavigate = () => {
    setLoading(true);
    router.push(route.myholliday);
  };
  return (
    <div key={language}>
      <HeaderAction
        title={t("registerVacaltional")}
        tooltip="Reservas agregadas"
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
        idicative="Reservas agregadas"
      />
      <Tabs defaultActiveIndex={0} tabs={tabs} />
    </div>
  );
}
