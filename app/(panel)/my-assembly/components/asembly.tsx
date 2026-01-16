"use client";
import React from "react";
import { Title, Tooltip } from "complexes-next-components";
// import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import Form from "./form";
import { CiViewTable } from "react-icons/ci";

export default function Asembly() {
  const router = useRouter();
  // const { t } = useTranslation();
  const { language } = useLanguage();
  return (
    <div key={language}>
      <div className="w-full flex justify-between mr-4 bg-cyan-800 shadow-lg opacity-80 p-2 rounded-md">
        <div>
          <Tooltip
            content="asambleas agregadas"
            className="cursor-pointer bg-gray-200"
            position="right"
          >
            <div className="bg-white/20 p-2 rounded-full cursor-pointer">
              <CiViewTable
                color="white"
                size={34}
                onClick={() => {
                  router.push(route.assembly);
                }}
              />
            </div>
          </Tooltip>
        </div>
        <Title size="sm" font="bold" className="text-white" translate="yes">
          Generar Asamblea
        </Title>
      </div>
      <Form />
    </div>
  );
}
