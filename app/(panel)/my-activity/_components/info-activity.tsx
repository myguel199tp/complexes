"use client";
import React from "react";
import { Title, Tooltip } from "complexes-next-components";
import Tables from "./table";
import { GiReturnArrow } from "react-icons/gi";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { useTranslation } from "react-i18next";

export default function InfoActivity() {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <>
      <div className="w-full mt-6  gap-5 flex justify-between mr-4 bg-cyan-800 shadow-lg opacity-80 p-2 rounded-md">
        <div className="cursor-pointer">
          <Tooltip
            content="Agregar actividad"
            className="bg-gray-200 "
            position="bottom"
          >
            <GiReturnArrow
              color="white"
              size={50}
              onClick={() => {
                router.push(route.myactivity);
              }}
            />
          </Tooltip>
        </div>
        <Title
          size="md"
          font="bold"
          translate="yes"
          tKey={t("actividadesAgregadas")}
          className="text-white"
        >
          Actividades Agregadas
        </Title>
      </div>
      <Tables />
    </>
  );
}
