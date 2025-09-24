// hooks/useCountryCityOptions.ts
import { useState } from "react";
import { useCityData } from "./fetch-city";

export function useCountryCityOptions() {
  const { data } = useCityData();
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(
    null
  );

  const countryAll =
    data?.map((country) => ({
      value: String(country.currency),
      label: country.country,
    })) || [];

  const countryOptions =
    data?.map((country) => ({
      value: String(country.ids),
      label: country.country,
    })) || [];

  const cityOptions =
    data
      ?.find((country) => String(country.ids) === selectedCountryId)
      ?.city.map((c) => ({
        value: String(c.id),
        label: c.name,
      })) || [];

  const indicativeOptions =
    data?.map((indicative) => ({
      value: indicative.indicative,
      label: indicative.indicative, // lo que se muestra
      searchLabel: `${indicative.indicative} ${indicative.country}`, // lo que se busca
    })) || [];
  const currencyOptions =
    data?.map((country) => ({
      value: String(country.currency),
      label: country.currency,
    })) || [];

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
