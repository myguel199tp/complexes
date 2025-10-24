import { useState } from "react";
import * as CountriesMocks from "countries-complexes";
import { Country } from "../services/response/cityResponse";
import { useHolidayPropertyData } from "@/app/(panel)/my-holliday/_components/holliday/_components/fetch-property-data";

export function useCountryCityOptions() {
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(
    null
  );
  const { data: property } = useHolidayPropertyData();

  const data: Country[] = Object.values(CountriesMocks).filter(
    (c: any) => c && c.country && c.ids
  ) as Country[];

  const countryAll = data.map((country) => ({
    value: String(country.ids ?? ""),
    label: String(country.country ?? ""),
    flag: country.flag,
  }));

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

  const indicativeOptions = data.map((indicative) => ({
    value: String(indicative.indicative ?? ""),
    label: `${indicative.indicative ?? ""} ${indicative.country ?? ""}`,
    searchLabel: `${indicative.indicative ?? ""} ${indicative.country ?? ""}`,
    image: indicative.flag,
  }));

  const currencyOptions = data.map((country) => ({
    value: String(country.currency ?? ""),
    label: String(country.currency ?? ""),
  }));

  // 🔹 Ordenamos PropertyOptions alfabéticamente por label
  const PropertyOptions =
    property
      ?.map((property) => ({
        value: `${property.ids}`,
        label: `${property.name}`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)) || [];

  return {
    countryOptions,
    PropertyOptions,
    currencyOptions,
    indicativeOptions,
    countryAll,
    data,
    cityOptions,
    setSelectedCountryId,
  };
}
