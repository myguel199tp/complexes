"use client";

import { route } from "@/app/_domain/constants/routes";
import { Title, Button, Text } from "complexes-next-components";
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
  ];

  const itemsNormal = [
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
      icon: "🛒",
      title: t("serviciosBeneficio.12.title"),
      text: t("serviciosBeneficio.12.text"),
    },
  ];

  const handleItemClick = (item: { title: string; text: string }) => {
    setSelected(item);
    setIsModalOpen(true);
  };
  const [isPendingAll, startTransitionAll] = useTransition();

  const handleClickAll = () => {
    startTransitionAll(() => {
      router.push(route.registerComplex);
    });
  };

  return (
    <div key={language}>
      <div className="border rounded-md mt-4 shadow-lg m-4">
        <section className="p-5">
          <div className="flex w-full bg-cyan-800 rounded-md justify-between">
            <Title
              size="xs"
              tKey={t("servicioOfrececonjunto")}
              translate="yes"
              font="bold"
              className="p-2 rounded-md text-white"
            >
              Qué ofrecemos para conjuntos
            </Title>

            <Button
              colVariant="warning"
              className="flex gap-2"
              onClick={handleClickAll}
              aria-label={t("inscripcion")}
            >
              {t("inscripcion")}
              {isPendingAll ? (
                <ImSpinner9 className="animate-spin text-base mr-2" />
              ) : null}
            </Button>
          </div>

          <div className="bg-white py-12 px-6">
            <div className="grid md:grid-cols-3 gap-8 text-center mt-8">
              {items.map((b, i) => (
                <div
                  key={i}
                  className="p-6 bg-blue-50 rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer"
                  onClick={() =>
                    handleItemClick({ title: b.title, text: b.text })
                  }
                >
                  <div className="text-4xl my-2">{b.icon}</div>
                  <Title as="h3" size="md" font="semi">
                    {b.title}
                  </Title>
                  <Text size="md" className="mt-1">
                    {b.text}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="p-5">
          <div className="flex w-full bg-cyan-800 rounded-md justify-between">
            <Title
              tKey={t("servicioOfrece")}
              translate="yes"
              size="xs"
              font="bold"
              className="p-2 rounded-md text-white"
            >
              Qué ofrecemos
            </Title>
            <Button
              colVariant="warning"
              tKey={t("registrarme")}
              onClick={() => router.push(route.registers)}
            >
              Registrarme gratis
            </Button>
          </div>

          <div className="bg-white py-12 px-6">
            <div className="grid md:grid-cols-3 gap-8 text-center mt-8">
              {itemsNormal.map((b, i) => (
                <div
                  key={i}
                  className="p-6 bg-blue-50 rounded-2xl shadow-sm hover:shadow-md transition cursor-pointer"
                  onClick={() =>
                    handleItemClick({ title: b.title, text: b.text })
                  }
                >
                  <div className="text-4xl my-2">{b.icon}</div>
                  <Title as="h3" size="md" font="semi">
                    {b.title}
                  </Title>
                  <Text size="md" className="mt-1">
                    {b.text}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {selected && (
        <ModalPlanSummary
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selected?.title || ""}
          text={selected?.text || ""}
        />
      )}
    </div>
  );
}
