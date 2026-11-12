import { COUNTRIES, COUNTRY_CODE_OPTIONS } from "@/app/helpers/countryCity";

/** País del banco del anfitrión: solo los habilitados, con el código ISO. */
export function useCountryOptions() {
  return {
    countryOptions: COUNTRY_CODE_OPTIONS,
    data: COUNTRIES,
  };
}
