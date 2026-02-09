"use client";
import React, { useState } from "react";
import Form from "./form";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { CiViewTable } from "react-icons/ci";
import { HeaderAction } from "@/app/components/header";
import { ImSpinner9 } from "react-icons/im";
import { FaCogs } from "react-icons/fa";
import { Button, Text } from "complexes-next-components";

export default function Foro() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleNavigate = () => {
    setLoading(true);
    router.push(route.foro);
  };
  return (
    <div key={language}>
      <HeaderAction
        title={t("agregarForo")}
        tooltip={t("foroAgregado")}
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
              Los foros sirven para hacer preguntas aprticipativas con los
              residentes esto sin necesidad de una asamblea, peude ayudar a
              saber la opinion de los residentes en algun asunto de importancia
              sin la necesidad de hacer algo tan formal como lo seria una
              asamblea.
            </Text>

            <Text size="xs">
              El foro será visible para todos los residentes una vez publicado.
            </Text>

            <Text size="xs" font="bold">
              Paquetes adicionales
            </Text>
            <Text size="xs">
              Tu plan actual es básico y tiene un límite de foros y preguntas
              mensuales. si quieres publicar mas puedes comprar el paquete o
              cambiar de plan
            </Text>

            <div className="flex flex-col gap-4 mt-2">
              <div className="border rounded-lg p-4 shadow-sm">
                <Text size="xs" font="bold">
                  📦 Básico Foro
                </Text>
                <Text size="xs">
                  +5 foros adicionales y +3 preguntas por foro
                </Text>
                <Text size="xs" font="semi">
                  $15.000 COP
                </Text>
                <Button size="xs" className="mt-3 w-full">
                  Comprar paquete
                </Button>
              </div>

              <div className="border rounded-lg p-4 shadow-sm">
                <Text size="xs">📦 Pro Foro</Text>
                <Text size="xs">
                  +15 noticias adicionales y +8 preguntas por foro
                </Text>
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
