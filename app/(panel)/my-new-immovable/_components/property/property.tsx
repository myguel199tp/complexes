"use client";
import React, { useState } from "react";
import Form from "./_components/form";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { route } from "@/app/_domain/constants/routes";
import { CiViewTable } from "react-icons/ci";
import { HeaderAction } from "@/app/components/header";
import { ImSpinner9 } from "react-icons/im";
import { FaCogs } from "react-icons/fa";
import { Text } from "complexes-next-components";
import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  formatMoney,
  getPublicationQuote,
  PLAN_LABEL,
} from "./services/publicationFeeService";

export default function Property() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  // Misma llave que el formulario: comparten la consulta.
  const { data: quote } = useQuery({
    queryKey: ["sales-publication-quote", conjuntoId],
    queryFn: () => getPublicationQuote(String(conjuntoId)),
    enabled: !!conjuntoId,
  });

  const handleNavigate = () => {
    setLoading(true);
    router.push(route.mynewimmovable);
  };

  return (
    <div key={language}>
      <HeaderAction
        title={t("registerinmovable")}
        tooltip="Inmuebles agregados"
        onClick={handleNavigate}
        icon={
          loading ? (
            <ImSpinner9 className="animate-spin text-white text-xl" />
          ) : (
            <CiViewTable color="white" size={34} />
          )
        }
        iconc={
          <div
            onClick={() => setShowInfo((prev) => !prev)}
            className="cursor-pointer"
          >
            <FaCogs color="white" size={22} />
          </div>
        }
        idicative="Inmuebles agregados"
      />
      <div className="w-full flex flex-col md:!flex-row gap-2">
        <Form />

        {showInfo && (
          <div
            className="
              flex flex-col gap-3 p-3 shadow-lg border rounded-lg
              w-full md:w-[220px] md:shrink-0
              max-h-[300px] md:max-h-[500px]
              overflow-y-auto scrollbar-hide
              mt-2
            "
          >
            <Text colVariant="on" size="xs" font="bold">
              ¿Qué puedes hacer?
            </Text>
            <Text colVariant="on" size="xs">
              Si vas a vender o arrendar tu apartamento o tienes algun otro
              domicilio que quieras arrendar o vender
            </Text>

            <Text colVariant="on" size="xs" font="bold">
              ¿Cuánto cuesta publicar?
            </Text>
            <Text colVariant="on" size="xs">
              Depende del plan de tu conjunto. Cada publicación dura 30 días y
              los cupos gratis cuentan las que tienes publicadas a la vez.
            </Text>

            <div className="flex flex-col gap-3 mt-1">
              {(quote?.plans ?? []).map((tariff) => {
                const current = tariff.plan === quote?.plan;

                return (
                  <div
                    key={tariff.plan}
                    className={`border rounded-lg p-3 shadow-sm ${current ? "border-emerald-500" : ""}`}
                  >
                    <Text colVariant="on" size="xs" font="bold">
                      {PLAN_LABEL[tariff.plan] ?? tariff.plan}
                      {current ? " · tu plan" : ""}
                    </Text>
                    <Text colVariant="on" size="xs">
                      {tariff.price <= 0
                        ? "Publicar es gratis"
                        : tariff.freeSlots > 0
                          ? `${tariff.freeSlots} gratis a la vez; las demás a ${formatMoney(tariff.total, quote?.currency)} con IVA`
                          : `Cada publicación a ${formatMoney(tariff.total, quote?.currency)} con IVA`}
                    </Text>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
