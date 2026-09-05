"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Button, Text, Title } from "complexes-next-components";
import { route } from "@/app/_domain/constants/routes";
import Reveal from "./Reveal";

/**
 * Cómo se arranca y qué pasa con los datos.
 *
 * Son las tres objeciones que frenan a un consejo de administración antes de
 * firmar: cuánto se demora en arrancar, la curva de aprendizaje y quién
 * responde por la información de los residentes.
 */
const PASOS = [
  { paso: "01", key: "step1" },
  { paso: "02", key: "step2" },
  { paso: "03", key: "step3" },
];

export default function TrustSection() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Reveal>
      <section
        className="relative overflow-hidden px-4 py-14 md:px-8"
        aria-labelledby="trust-title"
      >
        <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <Reveal delay={0.1}>
              <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-black/5 bg-white/60 px-5 py-3 backdrop-blur-xl">
                <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-blue-500" />
                <span className="text-sm font-medium">
                  {t("home.trust.badge")}
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <Title
                id="trust-title"
                as="h2"
                size="sm"
                font="bold"
                className="text-4xl leading-[1.05] tracking-[-0.03em] md:text-5xl"
              >
                {t("home.trust.title")}
              </Title>
            </Reveal>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {PASOS.map((item) => (
              <div
                key={item.paso}
                className="rounded-[28px] border border-black/5 bg-white/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,.08)] backdrop-blur-xl"
              >
                <Text size="sm" font="bold" className="text-cyan-700">
                  {item.paso}
                </Text>

                <Text font="bold" size="md" className="mt-2">
                  {t(`home.trust.${item.key}.title`)}
                </Text>

                <Text size="sm" className="mt-2 leading-relaxed text-gray-500">
                  {t(`home.trust.${item.key}.text`)}
                </Text>
              </div>
            ))}
          </div>

          {/* DATOS Y PRIVACIDAD */}
          <div className="mt-8 rounded-[32px] border border-black/5 bg-white/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,.08)] backdrop-blur-xl md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <Text font="bold" size="md">
                  {t("home.trust.data.title")}
                </Text>

                <Text size="sm" className="mt-2 leading-relaxed text-gray-500">
                  {t("home.trust.data.text")}
                </Text>
              </div>

              <Button
                colVariant="primary"
                rounded="md"
                onClick={() => router.push(route.termsConditions)}
              >
                {t("home.trust.data.cta")}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Reveal>
  );
}
