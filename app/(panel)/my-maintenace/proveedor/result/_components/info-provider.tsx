"use client";
import React from "react";
import { Title, Tooltip } from "complexes-next-components";
import Tables from "./table";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { useLanguage } from "@/app/hooks/useLanguage";
import { IoReturnDownBackOutline } from "react-icons/io5";

export default function InfoProviders() {
  const router = useRouter();
  const { language } = useLanguage();

  return (
    <div key={language}>
      <div className="w-full gap-5 flex justify-between mr-4 bg-cyan-800 shadow-lg opacity-80 p-2 rounded-md">
        <div className="cursor-pointer">
          <Tooltip
            content="Agregar actividad"
            className="bg-gray-200 "
            position="bottom"
          >
            <div className="bg-white/20 p-2 rounded-full cursor-pointer">
              <IoReturnDownBackOutline
                color="white"
                size={30}
                onClick={() => {
                  router.push(route.areaProveedor);
                }}
              />
            </div>
          </Tooltip>
        </div>
        <Title size="sm" font="bold" translate="yes" colVariant="on">
          Proveedores Registrados
        </Title>
      </div>
      <Tables />
    </div>
  );
}
