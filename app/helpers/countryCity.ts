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

/**
 * Países donde opera la plataforma, por código ISO. Los selectores (país,
 * ciudad, indicativo, moneda) solo ofrecen estos. Para abrir un país nuevo se
 * agrega aquí y en `ENABLED_COUNTRY_CODES` de las apps móviles.
 */
export const ENABLED_COUNTRY_CODES = ["CO"];

/**
 * Todos los países del paquete. Solo para resolver lo que ya está guardado
 * —que un registro viejo de otro país siga mostrando su nombre—, nunca para
 * ofrecer opciones.
 */
const ALL_COUNTRIES: Country[] = Object.values(CountriesMocks).filter(
  (c: Country) => c && c.country && c.ids,
) as Country[];

/** Los países habilitados: de aquí salen todas las opciones. */
export const COUNTRIES: Country[] = ALL_COUNTRIES.filter((c) =>
  ENABLED_COUNTRY_CODES.includes(String(c.code ?? "").toUpperCase()),
);

/** Sin tildes ni mayúsculas: "Ábrego" y "Abrego" son la misma ciudad. */
function normalize(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

/** Busca el país por `ids`, por código ISO o por nombre. */
export function findCountry(
  value?: string | number | null,
): Country | undefined {
  const raw = normalize(value);
  if (!raw) return undefined;

  return ALL_COUNTRIES.find(
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

/** El país, solo si está habilitado: lo demás no ofrece ciudades. */
function findEnabledCountry(value?: string | number | null) {
  const country = findCountry(value);
  return country && COUNTRIES.includes(country) ? country : undefined;
}

/** Si el valor guardado (ids, código o nombre) es de un país habilitado. */
export function isEnabledCountry(value?: string | number | null) {
  return !!findEnabledCountry(value);
}

function indicativeOptionsOf(countries: Country[]) {
  const seen = new Set<string>();
  return countries
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
}

/**
 * Opciones de indicativo con el mismo formato que usan los formularios de
 * registro (`"+57-Colombia"`), para que todos los selects guarden igual.
 */
export const INDICATIVE_OPTIONS = indicativeOptionsOf(COUNTRIES);

/**
 * Indicativos de todos los países, solo para los huéspedes de la renta
 * vacacional: el inmueble está en Colombia, pero el turista que reserva puede
 * tener teléfono de afuera.
 */
export const GUEST_INDICATIVE_OPTIONS = indicativeOptionsOf(ALL_COUNTRIES);

/**
 * Valor que entiende el `SelectField` de indicativo. Hay registros viejos que
 * guardaron solo el código ("+57" o "57"): sin resolverlos el select quedaba
 * vacío y al guardar se perdía el indicativo.
 */
export function indicativeSelectValue(value?: string | null) {
  const raw = String(value ?? "").trim();
  if (!raw || raw.includes("-")) return raw;

  const code = raw.startsWith("+") ? raw : `+${raw}`;
  return (
    INDICATIVE_OPTIONS.find((o) => o.value.startsWith(`${code}-`))?.value ??
    raw
  );
}

/** Opciones de país con el mismo valor que guarda el registro (el `ids`). */
export const COUNTRY_OPTIONS = COUNTRIES.map((country) => ({
  value: String(country.ids ?? ""),
  label: String(country.country ?? ""),
  image: country.flag,
}));

/**
 * Opciones de país con el código ISO ("CO") como valor, para los formularios
 * que guardan el código (registro del conjunto y país del banco).
 */
export const COUNTRY_CODE_OPTIONS = COUNTRIES.map((country) => ({
  value: String(country.code ?? ""),
  label: String(country.country ?? ""),
  image: country.flag,
  currency: country.currency,
}));

/** Monedas de los países habilitados, sin repetir. */
export const CURRENCY_OPTIONS = COUNTRIES.filter(
  (country, i, all) =>
    all.findIndex((c) => c.currency === country.currency) === i,
).map((country) => ({
  value: String(country.currency ?? ""),
  label: String(country.currency ?? ""),
  image: country.flag,
}));

/**
 * Ciudades del país indicado. Sin estado propio a diferencia de
 * `useCountryCityOptions`, para formularios con varias personas (familiares)
 * donde cada una puede elegir un país distinto.
 *
 * El paquete trae ciudades repetidas (mismo nombre y departamento con otro
 * id): se ofrece una sola, la de id menor, y en orden alfabético para que se
 * encuentren en una lista de cientos.
 */
export function cityOptionsFor(countryValue?: string | number | null) {
  const cities = [...(findEnabledCountry(countryValue)?.city ?? [])].sort(
    (a, b) => Number(a.id) - Number(b.id),
  );
  const seen = new Set<string>();

  return cities
    .filter((c) => {
      const key = `${normalize(c.name)}|${normalize(c.state?.name)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((c) => ({
      value: String(c.id ?? ""),
      label: `${String(c.name ?? "")} (${String(c.state?.name ?? "")})`,
      name: String(c.name ?? ""),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "es"));
}

/**
 * Las mismas ciudades, con el nombre como valor: para lo que se compara por
 * nombre normalizado (cobertura del comercio) y no por id.
 */
export function cityNameOptionsFor(countryValue?: string | number | null) {
  return cityOptionsFor(countryValue)
    .filter((o) => o.name !== "")
    .map((o) => ({ value: o.name, label: o.label }));
}
