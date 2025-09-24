"use client";

import { useAntiquityData } from "./fetch-antiquity-data";
import { useOfertData } from "./fetch-ofert-data";
import { useParkingData } from "./fetch-parking-data";
import { usePropertyData } from "./fetch-property-data";
import { useRestroomData } from "./fetch-restroom-data";
import { useRoomData } from "./fetch-room-data";
import { useStratumData } from "./fetch-stratum-data";
import { useVisitData } from "./fetch-visit-data";
import { useTranslation } from "react-i18next";

export default function RegisterOptions() {
  const { t } = useTranslation();

  const { data: parkings } = useParkingData();
  const { data: antiquitys } = useAntiquityData();
  const { data: restrooms } = useRestroomData();
  const { data: rooms } = useRoomData();
  const { data: ofert } = useOfertData();
  const { data: property } = usePropertyData();
  const { data: stratum } = useStratumData();
  const { data: visit } = useVisitData();

  const parkingOptions =
    parkings?.map((parking) => ({
      value: `${parking.ids}`,
      label: `${parking.name} ${t("parqueos")}`, // 🔹 traducido
    })) || [];

  const antiquitygOptions =
    antiquitys?.map((antiquity) => ({
      value: `${antiquity.ids}`,
      label: `${antiquity.name} ${t("años")}`, // 🔹 traducido
    })) || [];

  const restroomOptions =
    restrooms?.map((restroom) => ({
      value: `${restroom.ids}`,
      label: `${restroom.name} ${t("baños")}`, // 🔹 traducido
    })) || [];

  const roomOptions =
    rooms?.map((room) => ({
      value: `${room.ids}`,
      label: `${room.name} ${t("habitaciones")}`, // 🔹 traducido
    })) || [];

  const ofertOptions =
    ofert?.map((ofert) => ({
      value: `${ofert.ids}`,
      label: t(ofert.name), // 🔹 traducible
    })) || [];

  const propertyOptions =
    property?.map((property) => ({
      value: `${property.ids}`,
      label: t(property.name), // 🔹 traducible
    })) || [];

  const stratumOptions =
    stratum?.map((stratum) => ({
      value: `${stratum.ids}`,
      label: t(stratum.name), // 🔹 traducible
    })) || [];

  // 🔹 Mapeo para visitas
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

  return {
    antiquitygOptions,
    parkingOptions,
    restroomOptions,
    roomOptions,
    ofertOptions,
    propertyOptions,
    stratumOptions,
    visitOptions,
  };
}
