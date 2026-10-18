"use client";

import dynamic from "next/dynamic";

export type { LocationPickerProps, MapPoint } from "./location-picker-map";
export { placeSearchQueries } from "./place-search";

/**
 * Mapa para poner el pin de un lugar. Solo en el cliente: Leaflet usa
 * `window` al importarse.
 */
export const LocationPicker = dynamic(() => import("./location-picker-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[320px] w-full items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500">
      Cargando mapa...
    </div>
  ),
});
