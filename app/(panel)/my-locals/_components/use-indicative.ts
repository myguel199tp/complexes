import { INDICATIVE_OPTIONS } from "@/app/helpers/countryCity";

/** Indicativos de los países habilitados (hoy solo Colombia). */
export function useIndicativeOptions() {
  return {
    indicativeOptions: INDICATIVE_OPTIONS,
  };
}
