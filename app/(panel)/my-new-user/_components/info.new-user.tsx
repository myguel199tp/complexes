"use client";
import React from "react";
import { Title, Tooltip } from "complexes-next-components";
import Tables from "./table";
import { GiReturnArrow } from "react-icons/gi";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { useTranslation } from "react-i18next";

export default function InfoNewUser() {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <>
      <div className="w-full flex justify-between mr-4 bg-cyan-800 shadow-lg opacity-80 p-2 rounded-md">
        <div>
          <Tooltip
            content={t("agregarUsuario")}
            className="cursor-pointer bg-gray-200"
            position="right"
          >
            <GiReturnArrow
              color="white"
              size={30}
              onClick={() => {
                router.push(route.myuser);
              }}
            />
          </Tooltip>
        </div>
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
      <Tables />
    </>
  );
}
