"use client";
import React from "react";
import { Title } from "complexes-next-components";
import PersonalInfo from "./personal-info";
import ProfileChangesNotice from "./profile-changes-notice";
import MyWarningsNotice from "./my-warnings-notice";
import MyParcelsNotice from "./my-parcels-notice";
import MyLegalCaseNotice from "./my-legal-case-notice";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";

export default function PersonalInformation() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  return (
    <div key={language}>
      <div className="w-full gap-5 flex justify-end mr-4 bg-cyan-800 shadow-lg opacity-80 p-2 rounded-md">
        <Title
          translate="yes"
          size="sm"
          font="bold"
          className="text-white"
          tKey={t("personal")}
        >
          Información personal
        </Title>
      </div>

      <ProfileChangesNotice />

      {/* El cobro va primero: es lo que tiene consecuencias legales. */}
      <MyLegalCaseNotice />
      <MyWarningsNotice />
      <MyParcelsNotice />

      <PersonalInfo />
    </div>
  );
}
