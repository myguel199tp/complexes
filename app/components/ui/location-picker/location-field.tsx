"use client";

import { Text } from "complexes-next-components";
import type { MapPoint } from "./location-picker-map";
import { LocationPicker } from "./maps";
import { placeSearchQueries } from "./place-search";

export interface LocationFieldProps {
  value: MapPoint | null;
  onChange: (point: MapPoint | null) => void;
  /** Lo que van escribiendo en el formulario, para "Buscar la dirección". */
  address?: string;
  neighborhood?: string;
  /** La etiqueta de la ciudad ("Envigado (Antioquia)"), no el id. */
  city?: string;
  /** El nombre del país, para centrar el mapa en la ciudad. */
  country?: string;
  /** Código ISO del país ("CO"), para acotar la búsqueda. */
  countryCode?: string;
}

/**
 * "Ubicación en el mapa" de un formulario de publicación: el mapa con el pin,
 * la búsqueda por dirección y la opción de quitar el pin.
 */
export default function LocationField({
  value,
  onChange,
  address,
  neighborhood,
  city,
  country,
  countryCode,
}: LocationFieldProps) {
  const cityName = (city ?? "").replace(/\s*\([^()]*\)\s*$/, "").trim();

  return (
    <div className="space-y-1">
      <Text size="sm" font="semi" className="text-gray-700">
        Ubicación en el mapa (recomendada)
      </Text>
      <Text size="xs" className="text-gray-500">
        Marca dónde queda para que los interesados lo vean en el mapa y sepan
        cómo llegar. Si no lo marcas, lo ubicamos por la dirección y se ve como
        una zona aproximada.
      </Text>
      <LocationPicker
        value={value}
        onChange={onChange}
        center={null}
        centerQuery={
          cityName ? [cityName, country].filter(Boolean).join(", ") : undefined
        }
        searchQueries={placeSearchQueries({ address, neighborhood, city })}
        countryCode={countryCode}
        height={300}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-xs font-medium text-red-600 hover:underline"
        >
          Quitar el pin
        </button>
      )}
    </div>
  );
}
