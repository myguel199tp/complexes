import * as CountriesMocks from "countries-complexes";
import { Country } from "@/app/(sets)/registers/services/response/cityResponse";

export function useRegisterOptions() {
  const data: Country[] = Object.values(CountriesMocks).filter(
    (c: any) => c && c.country && c.ids,
  ) as Country[];

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

  return {
    indicativeOptions,
  };
}
