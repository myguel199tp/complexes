"use client";

import React from "react";
import { Title, Tooltip, Tabs } from "complexes-next-components";
import Tables from "./table";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { IoReturnDownBackOutline } from "react-icons/io5";
import TablesProperties from "./table-properties";
import TablesWorkers from "./table-workers";
import TablesRent from "./tables-rent";

export default function InfoNewUser() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <div key={language}>
      {/* Header */}
      <div className="w-full flex justify-between mr-4 bg-cyan-800 shadow-lg opacity-80 p-2 rounded-md">
        <Tooltip
          content={t("agregarUsuario")}
          className="cursor-pointer bg-gray-200"
          position="right"
        >
          <div className="bg-white/20 p-2 rounded-full cursor-pointer">
            <IoReturnDownBackOutline
              size={30}
              color="white"
              onClick={() => router.push(route.myuser)}
            />
          </div>
        </Tooltip>

        <Title
          size="sm"
          font="bold"
          translate="yes"
          tKey={t("usuariosAgregados")}
          className="text-white"
        >
          Usuarios agregados
        </Title>
      </div>

      {/* Tabs */}
      <div className="justify-center items-center">
        <Tabs
          defaultActiveIndex={0}
          tabs={[
            {
              tKey: "Todos los usuarios",
              size: "sm",
              children: <Tables />,
            },
            {
              tKey: "Propietarios",
              size: "sm",
              children: <TablesProperties />,
            },
            {
              tKey: "Colaboradores",
              size: "sm",
              children: (
                <div className="p-4">
                  <TablesWorkers />,
                </div>
              ),
            },
            {
              tKey: "Arrendatarios",
              size: "sm",
              children: <TablesRent />,
            },
          ]}
        />
      </div>
    </div>
  );
}
