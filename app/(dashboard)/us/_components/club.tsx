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
      title: "Participación en beneficios económicos del club",
      text: "El club permite que los conjuntos participen en incentivos económicos generados por actividades dentro del ecosistema. Estos beneficios no son ingresos garantizados ni automáticos y dependen del uso continuo del sistema.",
    },
    {
      icon: Handshake,
      title: "Acceso a alianzas y convenios del club",
      text: "Negociaciones colectivas con aseguradoras, empresas de mantenimiento y proveedores estratégicos, permitiendo condiciones preferenciales difíciles de obtener de forma individual.",
    },
    {
      icon: AlertTriangle,
      title: "Protección colectiva frente a morosidad",
      text: "El club no cobra cartera ni garantiza pagos. Implementa mecanismos preventivos, alertas tempranas y presión institucional para reducir la morosidad.",
    },
    {
      icon: Network,
      title: "Red privada de conjuntos residenciales",
      text: "Una comunidad privada donde los conjuntos comparten experiencias, estándares operativos y buenas prácticas para mejorar su gestión.",
    },
    {
      icon: ShoppingBag,
      title: "Marketplace del club",
      text: "Centralización de productos y servicios negociados por volumen, reduciendo costos y simplificando procesos de contratación.",
    },
    {
      icon: Headset,
      title: "Soporte y prioridad operativa",
      text: "El nivel de afiliación determina la prioridad de atención. Los niveles superiores reciben acompañamiento preferente.",
    },
    {
      icon: Users,
      title: "Participación en decisiones del ecosistema",
      text: "Los conjuntos con mayor nivel de afiliación pueden influir en la evolución del club, fortaleciendo el sentido de pertenencia.",
    },
    {
      icon: LayoutDashboard,
      title: "Gestión centralizada desde una sola plataforma",
      text: "Todas las operaciones del club se gestionan desde una plataforma centralizada. Esto incluye comunicación, beneficios, reportes, soporte, marketplace y participación institucional, garantizando trazabilidad, control y eficiencia operativa.",
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
              <Title size="sm" font="bold" className="text-slate-900">
                Beneficios de afiliarse
              </Title>
              <Text className="text-slate-500 mt-2 max-w-2xl">
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
                  className="
                    group relative
                    rounded-3xl bg-white p-6
                    border border-slate-200
                    shadow-sm hover:shadow-xl
                    hover:-translate-y-1 transition-all
                    cursor-pointer
                  "
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
