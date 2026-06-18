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
import { HeaderAction } from "@/app/components/header";
import { ImSpinner9 } from "react-icons/im";
import { FaCogs } from "react-icons/fa";
import ConjuntoDashboard from "./modal/ConjuntoDashboard";
import { useInfoExpenseQuery } from "../../my-bills/expenses/_components/expense-query";
import { useUsersQuery } from "./use-users-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import TablesAdminHoliday from "../../my-holliday/_components/holliday/_components/tables-admin";

export default function InfoNewUser() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const { data: expense = [] } = useInfoExpenseQuery();

  const [page] = useState(1);
  const limit = 1000;
  const { data: usersResponse } = useUsersQuery(page, limit);

  const users = usersResponse?.data ?? [];
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
      background: "primary",
      children: <Tables />,
    },
    {
      tKey: t("todosPropietarios"),
      background: "primary",

      children: <TablesProperties />,
    },
    {
      tKey: t("todosColaboradores"),
      background: "primary",

      children: <TablesWorkers />,
    },
    {
      tKey: t("todosArrendatarios"),
      background: "primary",

      children: <TablesRent />,
    },
    {
      tKey: "Reservas externas",
      background: "primary",
      children: <div>Las reservas externas</div>,
    },
    {
      tKey: "Reservas vacacionales",
      background: "primary",
      children: <TablesAdminHoliday />,
    },
  ];

  // Condicionar pestañas adicionales según plan
  if (plan === "gold" || plan === "platinum") {
    tabs.push({
      tKey: "Graficos",
      background: "primary",
      children: <ConjuntoDashboard data={users} expenses={expense} />,
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

      <div className="justify-center items-center bg-white mt-4 p-2">
        <Tabs defaultActiveIndex={0} tabs={tabs} />
      </div>
    </div>
  );
}
