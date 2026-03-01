import * as CountriesMocks from "countries-complexes";
import { Country } from "@/app/(sets)/registers/services/response/cityResponse";

export function useRegisterOptions() {
  const data = Object.values(CountriesMocks).filter(
    (c): c is Country =>
      typeof c === "object" && c !== null && "country" in c && "ids" in c,
  );

  const seen = new Set<string>();

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
