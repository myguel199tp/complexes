"use client";

import { route } from "@/app/_domain/constants/routes";
import { Title, Button, Text } from "complexes-next-components";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { ImSpinner9 } from "react-icons/im";

import {
  ShieldCheck,
  Handshake,
  AlertTriangle,
  Network,
  ShoppingBag,
  Headset,
  Users,
  LayoutDashboard,
} from "lucide-react";

export default function Club() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();

  const [isPendingAll, startTransitionAll] = useTransition();

  const items = [
    {
      icon: ShieldCheck,
      title: t("serviciosClub.0.title"),
      text: t("serviciosClub.0.text"),
      route: route.benefits,
    },
    {
      icon: Handshake,
      title: t("serviciosClub.1.title"),
      text: t("serviciosClub.1.text"),
      route: route.alianz,
    },
    {
      icon: AlertTriangle,
      title: t("serviciosClub.2.title"),
      text: t("serviciosClub.2.text"),
      route: route.colective,
    },
    {
      icon: Network,
      title: t("serviciosClub.3.title"),
      text: t("serviciosClub.3.text"),
      route: route.privat,
    },
    {
      icon: ShoppingBag,
      title: t("serviciosClub.4.title"),
      text: t("serviciosClub.4.text"),
      route: route.marketclub,
    },
    {
      icon: Headset,
      title: t("serviciosClub.5.title"),
      text: t("serviciosClub.5.text"),
      route: route.support,
    },
    {
      icon: Users,
      title: t("serviciosClub.6.title"),
      text: t("serviciosClub.6.text"),
      route: "",
    },
    {
      icon: LayoutDashboard,
      title: t("serviciosClub.7.title"),
      text: t("serviciosClub.7.text"),
      route: route.platform,
    },
  ];

  const handleClickAll = () => {
    startTransitionAll(() => {
      router.push(route.registerComplex);
    });
  };

  return (
    <div key={language} className="max-w-7xl mx-auto px-4 mt-4">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-xl">
        <section className="p-8 md:p-12">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
            <div>
              <Title
                tKey={t("beneficiosafiliarse")}
                size="sm"
                font="bold"
                className="text-slate-900"
              >
                Beneficios de afiliarse
              </Title>
              <Text
                tKey={t("formaparte")}
                size="sm"
                className="text-slate-500 mt-2"
              >
                Forma parte de una red privada de conjuntos residenciales con
                beneficios operativos, alianzas estratégicas y participación en
                la evolución del ecosistema.
              </Text>
            </div>

            <Button
              colVariant="warning"
              className="flex gap-2 px-6 py-3 rounded-full shadow-md hover:shadow-lg transition"
              onClick={handleClickAll}
            >
              {t("inscripcion")}
              {isPendingAll && (
                <ImSpinner9 className="animate-spin text-base" />
              )}
            </Button>
          </div>

          {/* BENEFITS GRID */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((b, i) => {
              const Icon = b.icon;

              return (
                <div
                  key={i}
                  onClick={() => {
                    if (b.route) {
                      router.push(b.route);
                    }
                  }}
                  className={`
                    group relative
                    rounded-3xl bg-white p-6
                    border border-slate-200
                    shadow-sm hover:shadow-xl
                    hover:-translate-y-1 transition-all
                    ${b.route ? "cursor-pointer" : "cursor-default"}
                  `}
                >
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-100 mb-4">
                    <Icon className="w-7 h-7 text-cyan-700" />
                  </div>

                  <Title
                    as="h3"
                    size="sm"
                    font="semi"
                    className="text-slate-900"
                  >
                    {b.title}
                  </Title>

                  <Text
                    size="sm"
                    className="
                      text-slate-500 mt-2
                      whitespace-normal
                      overflow-visible
                      max-h-none
                      line-clamp-none
                    "
                  >
                    {b.text}
                  </Text>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
