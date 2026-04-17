"use client";

import React, { useState } from "react";
import { Tabs } from "complexes-next-components";
import Tables from "./table";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { IoReturnDownBackOutline } from "react-icons/io5";
import TablesProperties from "./table-properties";
import TablesWorkers from "./table-workers";
import TablesRent from "./tables-rent";
import AssistantChat from "./assistantChat";
import { HeaderAction } from "@/app/components/header";
import { ImSpinner9 } from "react-icons/im";
import { FaCogs } from "react-icons/fa";
import ConjuntoDashboard from "./modal/ConjuntoDashboard";
import { useInfoExpenseQuery } from "../../my-bills/expenses/_components/expense-query";
import { useUsersQuery } from "./use-users-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export default function InfoNewUser() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const { data: expense = [] } = useInfoExpenseQuery();
  const { data = [] } = useUsersQuery();

  const planRaw = useConjuntoStore((state) => state.plan);
  const plan = ["basic", "gold", "platinum"].includes(String(planRaw))
    ? (planRaw as "basic" | "gold" | "platinum")
    : "basic";

  const handleBack = () => {
    setLoading(true);
    router.push(route.user);
  };

  const handleBackb = () => {
    setLoading(true);
    router.push(route.myworker);
  };

  // Construir tabs según el plan
  const tabs = [
    {
      tKey: t("todosUsuarios"),
      children: <Tables />,
    },
    {
      tKey: t("todosPropietarios"),
      children: <TablesProperties />,
    },
    {
      tKey: t("todosColaboradores"),
      children: (
        <div className="p-4">
          <TablesWorkers />
        </div>
      ),
    },
    {
      tKey: t("todosArrendatarios"),
      children: <TablesRent />,
    },
    {
      tKey: "Reservas externas",
      children: <div>Las reservas externas</div>,
    },
    {
      tKey: "Reservas vacacionales",
      children: <div>Las reservas vacacionales</div>,
    },
  ];

  // Condicionar pestañas adicionales según plan
  if (plan === "gold" || plan === "platinum") {
    tabs.push({
      tKey: "Graficos",
      children: <ConjuntoDashboard data={data} expenses={expense} />,
    });
  }

  if (plan === "basic" || plan === "gold" || plan === "platinum") {
    tabs.push({
      tKey: "IACMPLX",
      children: <AssistantChat />,
    });
  }

  return (
    <div key={language}>
      <HeaderAction
        title={t("usuariosAgregados")}
        tooltip="Agregar propietario"
        tooltipb="Agregar colaborador"
        onClick={handleBack}
        onClickb={handleBackb}
        icon={
          loading ? (
            <ImSpinner9 className="animate-spin text-white text-xl" />
          ) : (
            <IoReturnDownBackOutline color="white" size={34} />
          )
        }
        iconc={
          loading ? (
            <ImSpinner9 className="animate-spin text-white text-xl" />
          ) : (
            <FaCogs color="white" size={22} />
          )
        }
        iconb={
          loading ? (
            <ImSpinner9 className="animate-spin text-white text-xl" />
          ) : (
            <IoReturnDownBackOutline color="white" size={34} />
          )
        }
        idicative="Agregar propietario"
        idicativeb="Agregar colaborador"
      />

      <div className="justify-center items-center">
        <Tabs defaultActiveIndex={0} tabs={tabs} />
      </div>
    </div>
  );
}
