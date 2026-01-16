"use client";
import { route } from "@/app/_domain/constants/routes";
import { useLanguage } from "@/app/hooks/useLanguage";
import { Title, Tooltip } from "complexes-next-components";
import React from "react";
// import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import AllInfoPqr from "./all-info-pqr";
import { CiViewTable } from "react-icons/ci";

export default function Pqrinformation() {
  const router = useRouter();
  // const { t } = useTranslation();
  const { language } = useLanguage();
  return (
    <div key={language}>
      <div className="w-full flex justify-between mr-4 bg-cyan-800 shadow-lg opacity-80 p-2 rounded-md">
        <div className="cursor-pointer">
          <Tooltip
            content="pqr creados"
            className="cursor-pointer bg-gray-200"
            position="right"
          >
            <div className="bg-white/20 p-2 rounded-full cursor-pointer">
              <CiViewTable
                color="white"
                size={34}
                onClick={() => {
                  router.push(route.mypqr);
                }}
              />
            </div>
          </Tooltip>
        </div>
        <Title
          size="sm"
          font="bold"
          colVariant="on"
          translate="yes"
          //   tKey={t("myActividad")}
        >
          PQR generados
        </Title>
      </div>
      <AllInfoPqr />
    </div>
  );
}
