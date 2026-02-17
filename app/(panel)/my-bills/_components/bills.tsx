"use client";

import React, { useState } from "react";
import { CiViewTable } from "react-icons/ci";
import { ImSpinner9 } from "react-icons/im";

import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
// import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { HeaderAction } from "@/app/components/header";
import { FaCogs } from "react-icons/fa";
import { Text } from "complexes-next-components";
import Form from "./form";

export default function Bills() {
  const router = useRouter();
  //   const { t } = useTranslation();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleNavigate = () => {
    setLoading(true);
    router.push(route.expense);
  };

  return (
    <div key={language}>
      <HeaderAction
        title={"Agregar gastos"}
        tooltip={"Gastos agregados"}
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
            <FaCogs color="white" size={34} />
          </div>
        }
      />
      <div className="w-full flex gap-2">
        {/* FORM */}
        <div className={showInfo ? "flex-1" : "w-full"}>
          <Form />
        </div>

        {showInfo && (
          <div
            className="
              flex flex-col gap-3 p-3 shadow-lg border rounded-lg
              w-full md:w-[220px]
              max-h-[300px] md:max-h-[500px]
              overflow-y-auto scrollbar-hide
              mt-2
            "
          >
            <Text size="xs" font="bold">
              ¿Qué puedes hacer?
            </Text>
            <Text size="xs">
              Relaciona los gastos del conjunto o unidad residencial
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}
