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
import { Text, Button } from "complexes-next-components";

export default function News() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleNavigate = () => {
    setLoading(true);
    router.push(route.news);
  };

  return (
    <div key={language}>
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
              1. Escribe el título de la noticia. <br />
              <hr />
              2. Redacta el contenido (máximo 200 caracteres). <br />
              <hr />
              3. Adjunta una imagen relacionada. <br />
              <hr />
              <br />
              La noticia será visible para todos los residentes una vez
              publicada.
            </Text>

            <Text size="xs" font="bold">
              Paquetes adicionales
            </Text>
            <Text size="xs">
              Tu plan actual es básico y tiene un límite de publicaciones
              mensuales. si quieres publicar mas puedes comprar el paquete o
              cambair de plan
            </Text>

            <div className="flex flex-col gap-4 mt-2">
              <div className="border rounded-lg p-4 shadow-sm">
                <Text size="xs" font="bold">
                  📦 Básico Noticias
                </Text>
                <Text size="xs">+5 noticias adicionales</Text>
                <Text size="xs" font="semi">
                  $15.000 COP
                </Text>
                <Button size="xs" className="mt-3 w-full">
                  Comprar paquete
                </Button>
              </div>

              <div className="border rounded-lg p-4 shadow-sm">
                <Text size="xs" font="bold">
                  📦 Pro Noticias
                </Text>
                <Text size="xs">+15 noticias adicionales</Text>
                <Text size="xs" font="semi">
                  $35.000 COP
                </Text>
                <Button size="xs" className="mt-3 w-full">
                  Comprar paquete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
