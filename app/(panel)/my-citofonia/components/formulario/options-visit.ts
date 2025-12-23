"use client";

import { useVisitData } from "@/app/(panel)/my-new-immovable/_components/property/_components/fetch-visit-data";
import { useTranslation } from "react-i18next";

export function useVisitOptions() {
  const { t } = useTranslation();
  const { data: visit } = useVisitData();

  const visitTypeMap: Record<string, string> = {
    "Visita normal": "visit.normal",
    Repartidor: "visit.repartidor",
    Mensajero: "visit.mensajero",
    "Servicio técnico": "visit.servicio",
    "Profesional de salud": "visit.salud",
    Transporte: "visit.transporte",
    Autoridad: "visit.autoridad",
    Emergencia: "visit.emergencia",
    Comercial: "visit.comercial",
    "Obras / remodelación": "visit.obras",
    "Invitado a evento": "visit.evento",
  };

  const visitOptions =
    visit?.map((v) => ({
      value: `${v.ids}`,
      label: t(visitTypeMap[v.name] || v.name),
    })) || [];

  return { visitOptions };
}
