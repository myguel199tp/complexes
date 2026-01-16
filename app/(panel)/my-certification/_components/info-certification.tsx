"use client";
import React from "react";
import { Title, Tooltip } from "complexes-next-components";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import CertificationsInfo from "./certificationsInfo";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { IoReturnDownBackOutline } from "react-icons/io5";

export default function InfoCertification() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <div key={language}>
      <div className="w-full flex justify-between mr-4 bg-cyan-800 shadow-lg opacity-80 p-2 rounded-md">
        <div className="cursor-pointer">
          <Tooltip
            content={t("registroDocuemnto")}
            className="cursor-pointer bg-gray-200"
            position="right"
          >
            <div className="bg-white/20 p-2 rounded-full cursor-pointer">
              <IoReturnDownBackOutline
                color="white"
                size={30}
                onClick={() => {
                  router.push(route.mycertification);
                }}
              />
            </div>
          </Tooltip>
        </div>
        <Title
          size="sm"
          font="bold"
          colVariant="on"
          tKey={t("documentoAgregado")}
        >
          Documentos agregados
        </Title>
      </div>
      <CertificationsInfo />
    </div>
  );
}
