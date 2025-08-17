// hooks/useCountryCityOptions.ts
import { useState } from "react";
import { useCityData } from "./fetch-city";

export function useCountryCityOptions() {
  const { data } = useCityData();
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(
    null
  );

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

  return {
    countryOptions,
    cityOptions,
    setSelectedCountryId,
  };
}
