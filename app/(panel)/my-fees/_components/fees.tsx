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
import FeePaymentsTable from "./FeePaymentsTable";
import PendingVerificationPanel from "@/app/(panel)/my-new-user/_components/PendingVerificationPanel";
import CollectionAgreements from "./collection-agreements/collection-agreements";
import Portfolio from "./portfolio";
import { Tabs, Text } from "complexes-next-components";

/**
 * Pantalla de cuotas.
 *
 * Antes todo iba apilado en una sola columna —comprobantes por verificar,
 * botón de cartera, convenios de recaudo y, hasta abajo, la tabla— y había que
 * bajar mucho para llegar a lo que se consulta todos los días. Ahora cada
 * bloque es una pestaña y la tabla de pagos es lo primero que se abre.
 *
 * `Tabs` solo monta la pestaña activa, así que cartera y convenios no piden
 * datos al backend hasta que alguien entra a verlos.
 */
export default function Fees() {
  const router = useRouter();
  //   const { t } = useTranslation();
  const { language } = useLanguage();
  const { features } = usePlanFeatures();
  const [loading, setLoading] = useState(false);

  const handleNavigate = () => {
    setLoading(true);
    router.push(route.feees);
  };

  const tabs = [
    {
      label: "Cuotas y pagos",
      children: <FeePaymentsTable />,
    },
    {
      /*
        Lo primero que necesita la administración al entrar a cuotas es saber
        qué comprobantes le llegaron. Antes esa lista no estaba en ninguna
        pantalla, pese a que el endpoint existía.
      */
      label: "Comprobantes por verificar",
      children: <PendingVerificationPanel />,
    },
    {
      /*
        La cartera va desde el plan Oro. En básico la pestaña se muestra igual
        y dice de qué depende, para que se vea que la función existe. El
        permiso real lo aplica el backend.
      */
      label: "Cartera",
      children: features.portfolio ? (
        <Portfolio embedded />
      ) : (
        <div className="rounded-lg border bg-white p-4">
          <Text size="sm" font="bold">
            Disponible desde el plan Oro
          </Text>
          <Text size="xs" className="mt-1 text-gray-500">
            La cartera del conjunto y el cobro jurídico hacen parte del plan
            Oro. Con ellos ves quién debe, cuánto y desde hace cuántos días, y
            puedes enviar recordatorios de cobro.
          </Text>
        </div>
      ),
    },
    {
      /*
        Va junto a la configuración de cobro y no en pantalla aparte: para el
        administrador es una forma más de que le paguen, al lado de las cuentas
        bancarias, no un módulo distinto.
      */
      label: "Convenios de recaudo",
      children: <CollectionAgreements />,
    },
  ];

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
        idicative="Agrega las cuotas"
      />

      <div className="w-full pt-4">
        <Tabs defaultActiveIndex={0} tabs={tabs} scrollable />
      </div>
    </div>
  );
}
