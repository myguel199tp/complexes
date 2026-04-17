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
import { useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useVisitSocket } from "../hooks/useVisitSocket";

export default function Citofonie() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);

  useVisitSocket({
    onNewVisit: (visit) => {
      showAlert(`Nuevo visitante: ${visit.namevisit}`, "info");

      queryClient.invalidateQueries({ queryKey: ["visits"] });
    },
  });

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
            <FaCogs color="white" size={22} />
          </div>
        }
        idicative={t("visitasAgregadas")}
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
            <Text size="xs">
              Una ves guardado se tendra la trazabilidad de todas los visitantes
              que han entrado al conjunto o unidad residencial
            </Text>
          </div>
        )}
      </div>
    </div>
  );
}
