import { useState, useMemo } from "react";
import * as CountriesMocks from "countries-complexes";
import { Country } from "../services/response/cityResponse";
import { useHolidayPropertyData } from "@/app/(panel)/my-holliday/_components/holliday/_components/fetch-property-data";
import { useTranslation } from "react-i18next";

export function useCountryCityOptions() {
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(
    null
  );
  const { data: property } = useHolidayPropertyData();
  const { t } = useTranslation();

  const data: Country[] = Object.values(CountriesMocks).filter(
    (c: any) => c && c.country && c.ids
  ) as Country[];

  const countryOptions = data.map((country) => ({
    value: String(country.ids ?? ""),
    label: String(country.country ?? ""),
    image: country.flag,
  }));

  const cityOptions =
    data
      .find((country) => String(country.ids) === selectedCountryId)
      ?.city?.map((c) => ({
        value: String(c.id ?? ""),
        label: `${String(c.name ?? "")} (${String(c.state?.name ?? "")})`,
      })) || [];

  const seen = new Set();
  const indicativeOptions = data
    .filter((country) => {
      const key = `${country.indicative}-${country.country}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((country) => ({
      value: `${country.indicative}-${country.country}`,
      label: `${country.indicative} ${country.country}`,
      searchLabel: `${country.indicative} ${country.country}`,
      image: country.flag,
    }));

  const currencyOptions = data.map((country) => ({
    value: String(country.currency ?? ""),
    label: String(country.currency ?? ""),
    image: country.flag,
  }));

  // 🧠 Traducción automática con i18next
  const PropertyOptions = useMemo(() => {
    return (
      property
        ?.map((prop) => ({
          value: `${prop.ids}`,
          label: t(`propiedades.${prop.name}`) || prop.name, // ← usa las traducciones existentes
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
  };
}
