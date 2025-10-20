"use client";

import { useAmenitieData } from "./fetch-amenitie-data";

import { useTranslation } from "react-i18next";
import { useHolidayPropertyData } from "./fetch-property-data";

export default function RegisterOptions() {
  const { t } = useTranslation();

  const { data: amenities } = useAmenitieData();
  const { data: property } = useHolidayPropertyData();

  const amenitiesOptions =
    amenities?.map((amenities) => ({
      value: `${amenities.ids}`,
      label: `${amenities.name}`,
    })) || [];

  const PropertyOptions =
    property?.map((property) => ({
      value: `${property.ids}`,
      label: `${property.name} ${t("parqueos")}`, // 🔹 traducido
    })) || [];

  return {
    amenitiesOptions,
    PropertyOptions,
  };
}
