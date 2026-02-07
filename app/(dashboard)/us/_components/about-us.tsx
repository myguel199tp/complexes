"use client";

import { route } from "@/app/_domain/constants/routes";
import { Title, Button, Text, Badge } from "complexes-next-components";
import { useRouter } from "next/navigation";
import React, { useState, useTransition } from "react";
import ModalPlanSummary from "./modal/modal";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { ImSpinner9 } from "react-icons/im";

export default function Aboutus() {
  const router = useRouter();
  const [selected, setSelected] = useState<{
    title: string;
    text: string;
  } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [isPendingAll, startTransitionAll] = useTransition();

  const items = [
    {
      icon: "🔒",
      title: t("serviciosBeneficio.0.title"),
      text: t("serviciosBeneficio.0.text"),
    },
    {
      icon: "💬",
      title: t("serviciosBeneficio.1.title"),
      text: t("serviciosBeneficio.1.text"),
    },
    {
      icon: "🏘️",
      title: t("serviciosBeneficio.2.title"),
      text: t("serviciosBeneficio.2.text"),
    },
    {
      icon: "🏖️",
      title: t("serviciosBeneficio.3.title"),
      text: t("serviciosBeneficio.3.text"),
    },
    {
      icon: "💰",
      title: t("serviciosBeneficio.4.title"),
      text: t("serviciosBeneficio.4.text"),
    },
    {
      icon: "📞",
      title: t("serviciosBeneficio.5.title"),
      text: t("serviciosBeneficio.5.text"),
    },
    {
      icon: "👥",
      title: t("serviciosBeneficio.6.title"),
      text: t("serviciosBeneficio.6.text"),
    },
    {
      icon: "📢",
      title: t("serviciosBeneficio.7.title"),
      text: t("serviciosBeneficio.7.text"),
    },
    {
      icon: "📅",
      title: t("serviciosBeneficio.8.title"),
      text: t("serviciosBeneficio.8.text"),
    },
    {
      icon: "🚪",
      title: t("serviciosBeneficio.9.title"),
      text: t("serviciosBeneficio.9.text"),
    },
    {
      icon: "📝",
      title: t("serviciosBeneficio.10.title"),
      text: t("serviciosBeneficio.10.text"),
    },
    {
      icon: "📰",
      title: t("serviciosBeneficio.11.title"),
      text: t("serviciosBeneficio.11.text"),
    },
    {
      icon: "🛒",
      title: t("serviciosBeneficio.12.title"),
      text: t("serviciosBeneficio.12.text"),
    },
    {
      icon: "📊",
      title: t("serviciosBeneficio.13.title"),
      text: t("serviciosBeneficio.13.text"),
    },
    {
      icon: "💬",
      title: t("serviciosBeneficio.14.title"),
      text: t("serviciosBeneficio.14.text"),
    },
    {
      icon: "📂",
      title: t("serviciosBeneficio.15.title"),
      text: t("serviciosBeneficio.15.text"),
    },
    {
      icon: "🛠️",
      title: t("serviciosBeneficio.16.title"),
      text: t("serviciosBeneficio.16.text"),
    },
    {
      icon: "🗳️",
      title: t("serviciosBeneficio.17.title"),
      text: t("serviciosBeneficio.17.text"),
    },
    {
      icon: "🏨",
      title: t("serviciosBeneficio.18.title"),
      text: t("serviciosBeneficio.18.text"),
    },
  ];

  const handleItemClick = (item: { title: string; text: string }) => {
    setSelected(item);
    setIsModalOpen(true);
  };

  const handleClickAll = () => {
    startTransitionAll(() => {
      router.push(route.registerComplex);
    });
  };

  return (
    <section key={language} className="space-y-10">
      {/* HERO */}
      <header className="rounded-2xl bg-gradient-to-br from-cyan-800 to-cyan-600 p-8 shadow-xl text-white">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <Badge className="bg-white/20 text-white w-fit">
              Ecosistema modular
            </Badge>

            <Title size="md" font="bold">
              Módulos de la plataforma
            </Title>

            <Text className="text-cyan-100">
              Herramientas integradas para la gestión moderna de conjuntos,
              comunicación institucional y control preventivo.
            </Text>
          </div>

          <Button
            colVariant="warning"
            className="flex gap-2 h-fit"
            onClick={handleClickAll}
            aria-label={t("inscripcion")}
          >
            {t("inscripcion")}
            {isPendingAll && <ImSpinner9 className="animate-spin text-base" />}
          </Button>
        </div>
      </header>

      {/* GRID DE MÓDULOS */}
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((b, i) => (
          <div
            key={i}
            onClick={() => handleItemClick({ title: b.title, text: b.text })}
            className="group cursor-pointer rounded-2xl border bg-white p-6 shadow-sm transition
                       hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-3xl">{b.icon}</div>
              <span className="text-xs text-cyan-700 opacity-0 group-hover:opacity-100 transition">
                Ver más
              </span>
            </div>

            <Title as="h3" size="sm" font="semi">
              {b.title}
            </Title>

            <Text size="xs" className="mt-2 text-gray-600 line-clamp-3">
              {b.text}
            </Text>
          </div>
        ))}
      </div>

      {selected && (
        <ModalPlanSummary
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selected.title}
          text={selected.text}
        />
      )}
    </section>
  );
}
