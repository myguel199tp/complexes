"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
// import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { usePlanFeatures } from "@/app/hooks/usePlanFeatures";
import { CiViewTable } from "react-icons/ci";
import { HeaderAction } from "@/app/components/header";
import { ImSpinner9 } from "react-icons/im";
import { FaCogs } from "react-icons/fa";
import FeePaymentsTable from "./FeePaymentsTable";
import PendingVerificationPanel from "@/app/(panel)/my-new-user/_components/PendingVerificationPanel";
import CollectionAgreements from "./collection-agreements/collection-agreements";
import { Text } from "complexes-next-components";

export default function Fees() {
  const router = useRouter();
  //   const { t } = useTranslation();
  const { language } = useLanguage();
  const { features } = usePlanFeatures();
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleNavigate = () => {
    setLoading(true);
    router.push(route.feees);
  };
  return (
    <div
      key={language}
      className="flex flex-col w-full min-h-screen p-4 box-border"
    >
      <HeaderAction
        title="Cuotas agregadas"
        tooltip="Agrega las cuotas"
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
        idicative="Agrega las cuotas"
      />
      {/*
        Lo primero que necesita la administración al entrar a cuotas es saber
        qué comprobantes le llegaron. Antes esa lista no estaba en ninguna
        pantalla, pese a que el endpoint existía.
      */}
      <div className="w-full px-4 pt-4">
        <PendingVerificationPanel />
      </div>

      {/*
        La cartera va desde el plan Oro. En básico el botón se muestra
        deshabilitado en vez de esconderse, para que se vea que la función
        existe y de qué depende. El permiso real lo aplica el backend.
      */}
      <div className="w-full px-4 pt-4">
        <button
          disabled={!features.portfolio}
          onClick={() => features.portfolio && router.push(route.feesPortfolio)}
          className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${
            features.portfolio
              ? "bg-cyan-600 hover:bg-cyan-700"
              : "cursor-not-allowed bg-gray-400"
          }`}
        >
          Ver cartera del conjunto
        </button>

        {!features.portfolio && (
          <Text size="xs" className="mt-1 text-gray-500">
            La cartera y el cobro jurídico están disponibles desde el plan Oro.
          </Text>
        )}
      </div>

      {/*
        Va junto a la configuración de cobro y no en pantalla aparte: para el
        administrador es una forma más de que le paguen, al lado de las cuentas
        bancarias, no un módulo distinto.
      */}
      <div className="w-full px-4 pt-4">
        <CollectionAgreements />
      </div>

      <div className="w-full flex gap-2">
        <div className={showInfo ? "flex-1" : "w-full"}>
          <FeePaymentsTable />
        </div>
      </div>
    </div>
  );
}
