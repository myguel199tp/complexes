import { Country } from "@/app/(dashboard)/registers/services/response/cityResponse";
import * as CountriesMocks from "countries-complexes";

export function useCountryOptions() {
  const data: Country[] = Object.values(CountriesMocks).filter(
    (c: any) => c && c.country && c.ids
  ) as Country[];

  const countryOptions = data.map((country) => ({
    value: String(country.code ?? ""),
    label: String(country.country ?? ""),
    image: country.flag,
  }));

  return {
    countryOptions,
    data,
  };
}
