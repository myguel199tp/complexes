"use client";
import React, { useState } from "react";
import Form from "./formulario/form";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { CiViewTable } from "react-icons/ci";
import { HeaderAction } from "@/app/components/header";
import { ImSpinner9 } from "react-icons/im";
import { FaCogs } from "react-icons/fa";
import { Text } from "complexes-next-components";

export default function Citofonie() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleNavigate = () => {
    setLoading(true);
    router.push(route.citofonia);
  };

  return (
    <div key={language}>
      <HeaderAction
        title={t("registrarVisitante")}
        tooltip={t("visitasAgregadas")}
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
              Relaciona las personas que entran al condominio
            </Text>

            <Text size="xs" font="bold">
              ¿Cómo funciona?
            </Text>
            <Text size="xs">
              1. Elige el apartamento al que se dirige el visitante. <br />
              2. Selecciona tipo de visitante. <br />
              3. Nombre del visitante. <br />
              4. Identificación de visitantes. <br />
              5. Si existe vehiculo entrante escribir la placa. <br />
              6. agregar foto o imagen que considere necesaria. <br />
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}
