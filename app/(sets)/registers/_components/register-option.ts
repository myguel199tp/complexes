"use client";
import { useState, useMemo } from "react";
import { Country } from "../services/response/cityResponse";
import {
  cityOptionsFor,
  COUNTRIES,
  COUNTRY_OPTIONS,
  CURRENCY_OPTIONS,
  INDICATIVE_OPTIONS,
} from "@/app/helpers/countryCity";
import { useHolidayPropertyData } from "@/app/(panel)/my-holliday/_components/holliday/_components/fetch-property-data";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";

export function useCountryCityOptions() {
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(
    null,
  );
  const { data: property } = useHolidayPropertyData();
  const { t } = useTranslation();
  const { language } = useLanguage();

  // Solo los países habilitados (hoy Colombia): ver `ENABLED_COUNTRY_CODES`.
  const data: Country[] = COUNTRIES;
  const countryOptions = COUNTRY_OPTIONS;
  const cityOptions = cityOptionsFor(selectedCountryId);
  const indicativeOptions = INDICATIVE_OPTIONS;
  const currencyOptions = CURRENCY_OPTIONS;

  const PropertyOptions = useMemo(() => {
    return (
      property
        ?.map((prop) => ({
          value: `${prop.ids}`,
          label: t(`propiedades.${prop.name}`) || prop.name,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)) || []
    );
  }, [property, t]);

  return {
    countryOptions,
    PropertyOptions,
    currencyOptions,
    indicativeOptions,
    data,
    cityOptions,
    setSelectedCountryId,
    language,
  };
}
