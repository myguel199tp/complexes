"use client";
import React from "react";
import { Title, Tooltip } from "complexes-next-components";
import { route } from "@/app/_domain/constants/routes";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/hooks/useLanguage";
import Form from "./form";
import { CiViewTable } from "react-icons/ci";

export default function NewLocals() {
  const router = useRouter();
  const { language } = useLanguage();
  return (
    <div key={language}>
      <div className="w-full gap-5 flex justify-between mr-4 bg-cyan-800 shadow-lg opacity-80 p-2 rounded-md">
        <div className="cursor-pointer">
          <Tooltip
            content="Locales agregados"
            className="cursor-pointer bg-gray-200"
            position="right"
          >
            <div className="bg-white/20 p-2 rounded-full cursor-pointer">
              <CiViewTable
                color="white"
                size={34}
                onClick={() => {
                  router.push(route.user);
                }}
              />
            </div>
          </Tooltip>
        </div>
        <Title size="sm" font="bold" className="text-white" translate="yes">
          Agregar locales
        </Title>
      </div>
      <Form />
    </div>
  );
}
