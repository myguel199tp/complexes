"use client";

import dynamic from "next/dynamic";

/**
 * Los mapas solo existen en el cliente: Leaflet usa `window` al importarse.
 */

/** Mapa para poner el pin de un lugar. */
export const LocationPicker = dynamic(() => import("./location-picker-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[320px] w-full items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-500">
      Cargando mapa...
    </div>
  ),
});

/** Mapa para ver dónde queda un lugar. Llena el contenedor. */
export const LocationView = dynamic(() => import("./location-view-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gray-50 text-sm text-gray-500">
      Cargando mapa...
    </div>
  ),
});
