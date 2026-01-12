import * as CountriesMocks from "countries-complexes";
import { Country } from "../../services/response/cityResponse";

export function useCountryOptions() {
  const data: Country[] = Object.values(CountriesMocks).filter(
    (c: any) => c && c.country && c.ids
  ) as Country[];

  const countryOptions = data.map((country) => ({
    value: String(country.code ?? ""),
    label: String(country.country ?? ""),
    image: country.flag,
    currency: country.currency,
  }));

  return {
    countryOptions,
    data,
  };
}
