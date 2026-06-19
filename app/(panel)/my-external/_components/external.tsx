"use client";
import React, { useState } from "react";
// import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { CiViewTable } from "react-icons/ci";
import { Text } from "complexes-next-components";
import { HeaderAction } from "@/app/components/header";
import { FaCogs } from "react-icons/fa";
import { ImSpinner9 } from "react-icons/im";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";

export default function External() {
  const router = useRouter();
  // const { t } = useTranslation();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleNavigate = () => {
    setLoading(true);
    router.push(route.myholliday);
  };

  return (
    <div key={language}>
      <HeaderAction
        title="Registros externos a plataforma externa"
        tooltip="Registro y conección de plataforma externa"
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
        idicative="Registro y conección de plataforma externa"
      />

      <Text size="sm" className="text-gray-500 mt-4">
        Para conectar Airbnb/Booking/VRBO a una unidad, abre el listado de
        unidades vacacionales y usa el ícono &quot;Plataformas
        externas&quot; en la fila de la unidad correspondiente.
      </Text>
    </div>
  );
}
