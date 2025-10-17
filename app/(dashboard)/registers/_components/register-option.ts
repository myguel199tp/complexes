import { useState } from "react";
import * as CountriesMocks from "countries-complexes";
import { Country } from "../services/response/cityResponse";

export function useCountryCityOptions() {
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(
    null
  );

  // Filtramos solo los países válidos
  const data: Country[] = Object.values(CountriesMocks).filter(
    (c: any) => c && c.country && c.ids
  ) as Country[];

  const countryAll = data.map((country) => ({
    value: String(country.ids ?? ""),
    label: String(country.country ?? ""),
  }));

  const countryOptions = data.map((country) => ({
    value: String(country.ids ?? ""),
    label: String(country.country ?? ""),
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
  }));

  const currencyOptions = data.map((country) => ({
    value: String(country.currency ?? ""),
    label: String(country.currency ?? ""),
  }));

  return {
    countryOptions,
    currencyOptions,
    indicativeOptions,
    countryAll,
    data,
    cityOptions,
    setSelectedCountryId,
  };
}
