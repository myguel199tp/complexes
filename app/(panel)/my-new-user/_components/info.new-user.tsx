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

export default function InfoNewUser() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    setLoading(true);
    router.push(route.myprofile);
  };
  return (
    <div key={language}>
      {/* Header */}
      <HeaderAction
        title={t("usuariosAgregados")}
        tooltip={t("myuser")}
        onClick={handleBack}
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
            <FaCogs color="white" size={34} />
          )
        }
      />

      {/* Tabs */}

      <div className="justify-center items-center">
        <Tabs
          defaultActiveIndex={0}
          tabs={[
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
                  <TablesWorkers />,
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
            {
              tKey: "IACMPLX",
              children: <AssistantChat />,
            },
          ]}
        />
      </div>
    </div>
  );
}
