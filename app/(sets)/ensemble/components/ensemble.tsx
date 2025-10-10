"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { Title, Text, Avatar } from "complexes-next-components";
import { useConjuntoStore } from "./use-store";
import { useEnsembleInfo } from "./ensemble-info";
import { ImSpinner9 } from "react-icons/im";
import { useCountryCityOptions } from "@/app/(dashboard)/registers/_components/register-option";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import Link from "next/link";

export default function Ensemble() {
  const { data, loading } = useEnsembleInfo();
  const { countryOptions, data: datacountry } = useCountryCityOptions();
  const router = useRouter();
  const setConjuntoId = useConjuntoStore((state) => state.setConjuntoId);
  const setConjuntoName = useConjuntoStore((state) => state.setConjuntoName);
  const { t } = useTranslation();
  const { language } = useLanguage();
  const roleTranslations: Record<string, string> = {
    owner: t("propietario"),
    tenant: t("inquilino"),
    resident: t("residente"),
    visitor: t("visitante"),
    employee: t("trabajo"),
  };

  const [navigating, setNavigating] = useState(false);

  if (loading || navigating)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <ImSpinner9 className="animate-spin text-white text-6xl" />
      </div>
    );

  if (!data.length) return <div>No hay datos</div>;

  return (
    <div
      key={language}
      style={{
        backgroundImage: "url('/cici.jpg')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className="flex flex-col items-center justify-center h-screen relative"
    >
      {/* 🔝 Header */}
      <header className="absolute top-0 left-0 w-full flex justify-between items-center px-8 py-4 bg-white/70 backdrop-blur-md shadow-md">
        <Title as="h2" className="text-2xl font-bold text-gray-800">
          Bienvenido, Elije el conjunto que deseas usar
        </Title>
        <Link href="/return-password" className="text-blue-300">
          Cambiar contraseña
        </Link>
      </header>

      {/* 🏘️ Contenido principal */}
      <div className="flex flex-wrap justify-center gap-6 mt-20">
        {data.map((item) => {
          const { id, apartment, role, isMainResidence, active, conjunto } =
            item;
          const fileImage = conjunto?.file || "";
          const BASE_URL =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
          const fileName = fileImage
            ? `${BASE_URL}/uploads/${fileImage.replace(/^.*[\\/]/, "")}`
            : "";

          const countryLabel =
            countryOptions.find((c) => c.value === String(conjunto.country))
              ?.label || conjunto.country;

          const cityLabel =
            datacountry
              ?.find((c) => String(c.ids) === String(conjunto.country))
              ?.city.find((c) => String(c.id) === String(conjunto.city))
              ?.name || conjunto.city;

          return (
            <div
              key={id}
              className="w-full max-w-md bg-cyan-800 text-white  p-4 hover:bg-white/50 hover:text-black rounded-lg shadow-2xl cursor-pointer transition-all duration-200"
              onClick={() => {
                setConjuntoId(conjunto.id);
                setConjuntoName(conjunto.name);
                setNavigating(true);
                router.push(route.myprofile);
              }}
            >
              <section className="flex justify-between">
                <div>
                  <Title className="text-xl font-semibold">
                    {conjunto.name}
                  </Title>
                  <Text size="sm" font="semi">
                    {conjunto.address}
                  </Text>

                  <Text size="sm" font="semi">
                    {countryLabel} | {cityLabel} | {conjunto.neighborhood}
                  </Text>

                  <hr className="my-2" />

                  {apartment !== null && (
                    <Text size="sm">
                      <Text font="bold">Apartamento</Text> {apartment}
                    </Text>
                  )}

                  <Text size="sm" font="semi" className="mt-4">
                    {roleTranslations[role] || role}
                  </Text>

                  {isMainResidence !== null && (
                    <Text size="sm" font="semi">
                      {isMainResidence ? t("recide") : t("norecide")}
                    </Text>
                  )}

                  {active !== null && (
                    <Text size="sm" font="semi">
                      {active ? t("activado") : t("desactivado")}
                    </Text>
                  )}
                </div>

                <div className="flex justify-end">
                  <Avatar
                    src={fileName}
                    alt={`${conjunto.name}`}
                    size="xxl"
                    border="thick"
                    shape="round"
                  />
                </div>
              </section>
            </div>
          );
        })}
      </div>
    </div>
  );
}
