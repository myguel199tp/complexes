"use client";
import React from "react";
import { Title, Tooltip } from "complexes-next-components";
import { GiReturnArrow } from "react-icons/gi";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import CertificationsInfo from "./certificationsInfo";
import { useTranslation } from "react-i18next";

export default function InfoCertification() {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <>
      <div className="w-full flex justify-between mr-4 bg-cyan-800 shadow-lg opacity-80 p-2 rounded-md">
        <div className="cursor-pointer">
          <Tooltip
            content={t("registroDocuemnto")}
            className="cursor-pointer bg-gray-200"
            position="right"
          >
            <GiReturnArrow
              color="white"
              size={30}
              onClick={() => {
                router.push(route.mycertification);
              }}
            />
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
    </>
  );
}
