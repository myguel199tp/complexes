import { COUNTRIES, COUNTRY_CODE_OPTIONS } from "@/app/helpers/countryCity";

/** Países habilitados para pagar el plan, con el código ISO y su moneda. */
export function useCountryOptions() {
  return {
    countryOptions: COUNTRY_CODE_OPTIONS,
    data: COUNTRIES,
  };
}
