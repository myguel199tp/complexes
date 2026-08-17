import * as CountriesMocks from "countries-complexes";
import { Country } from "@/app/(sets)/registers/services/response/cityResponse";

/**
 * Resolución de país/ciudad contra `countries-complexes`.
 *
 * El país no se guarda igual en todos lados: los formularios de inmuebles
 * mandan el `ids` numérico (200) y el registro del conjunto guarda el código
 * ISO ("CO"). Buscar solo por `ids` dejaba pantallas mostrando "CO" y "1" en
 * vez de "Colombia" y "Bogotá", que es lo único que le sirve al residente.
 *
 * El listado sale del paquete, que es estático, así que estos helpers no
 * dependen de ningún hook ni de que haya cargado una consulta.
 */
export const COUNTRIES: Country[] = Object.values(CountriesMocks).filter(
  (c: Country) => c && c.country && c.ids,
) as Country[];

function normalize(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

/** Busca el país por `ids`, por código ISO o por nombre. */
export function findCountry(
  value?: string | number | null,
): Country | undefined {
  const raw = normalize(value);
  if (!raw) return undefined;

  return COUNTRIES.find(
    (c) =>
      normalize(c.ids) === raw ||
      normalize(c.code) === raw ||
      normalize(c.country) === raw,
  );
}

/** Nombre del país; si no se puede resolver, devuelve lo que haya guardado. */
export function countryName(value?: string | number | null) {
  if (value === null || value === undefined || value === "") return "";
  return findCountry(value)?.country ?? String(value);
}

/**
 * Nombre de la ciudad. Los ids de ciudad solo son únicos dentro de su país, así
 * que sin país resuelto no se intenta adivinar: se muestra el valor crudo.
 */
export function cityName(
  countryValue?: string | number | null,
  cityValue?: string | number | null,
) {
  const raw = String(cityValue ?? "").trim();
  if (!raw) return "";

  const cities = findCountry(countryValue)?.city ?? [];
  const city =
    cities.find((c) => normalize(c.id) === normalize(raw)) ??
    cities.find((c) => normalize(c.name) === normalize(raw));

  return city?.name ?? raw;
}

/**
 * Valor que entienden los `SelectField` de país (siempre el `ids`), para que un
 * país guardado como "CO" quede preseleccionado en vez de aparecer vacío.
 */
export function countrySelectValue(value?: string | number | null) {
  const country = findCountry(value);
  return country ? String(country.ids) : String(value ?? "");
}
