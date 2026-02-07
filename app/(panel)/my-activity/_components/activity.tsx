"use client";
import React, { useState } from "react";
import Form from "./form";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { CiViewTable } from "react-icons/ci";
import { HeaderAction } from "@/app/components/header";
import { ImSpinner9 } from "react-icons/im";
import { FaCogs } from "react-icons/fa";
import { Text } from "complexes-next-components";

export default function Activity() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleNavigate = () => {
    setLoading(true);
    router.push(route.activity);
  };
  return (
    <div
      key={language}
      className="flex flex-col w-full min-h-screen p-4 box-border"
    >
      <HeaderAction
        title={t("myActividad")}
        tooltip={t("actividadesAgregadas")}
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
              Publica noticias para mantener informados a todos los residentes
              del conjunto residencial de manera rápida y efectiva.
            </Text>

            <Text size="xs" font="bold">
              ¿Cómo funciona?
            </Text>
            <Text size="xs">
              1. Nombre de la actividad. <br />
              2. Redacta el contenido (máximo 200 caracteres). <br />
              3. Escribe al cantidad de personas a estar en la actividad. <br />
              4. Escribe el horario en que podra realizar la actividad. <br />
              5. Defin el tiempo en que se podra realizar la activdad. <br />
              6. Adjunta una imagen relacionada. <br />
              La Actividad será visible para todos los residentes una vez
              publicada y podran apartar .
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}
