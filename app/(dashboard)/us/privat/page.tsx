"use client";

import { route } from "@/app/_domain/constants/routes";
import { Title, Button } from "complexes-next-components";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { ImSpinner9 } from "react-icons/im";

export default function Page() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [isPendingAll, startTransitionAll] = useTransition();

  const handleClickAll = () => {
    startTransitionAll(() => {
      router.push(route.registerComplex);
    });
  };

  return (
    <div
      key={language}
      className="flex w-full bg-cyan-800 rounded-md justify-between items-center"
    >
      <Title size="xs" translate="yes" font="bold" className="p-2 text-white">
        Red privada de conjuntos residenciales
      </Title>

      <Button
        colVariant="warning"
        className="flex gap-2 items-center"
        onClick={handleClickAll}
        aria-label={t("inscripcion")}
        disabled={isPendingAll}
      >
        {t("inscripcion")}
        {isPendingAll && <ImSpinner9 className="animate-spin text-base" />}
      </Button>
    </div>
  );
}
