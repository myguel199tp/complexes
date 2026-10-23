"use client";

import { useEffect, useState } from "react";
import type { MapPoint } from "./location-picker-map";
import { findPlace, placeSearchQueries } from "./place-search";

export interface PlaceToLocate {
  latitude?: number | string | null;
  longitude?: number | string | null;
  /** 'pin' si lo marcaron en el mapa; lo demás salió de una dirección. */
  locationSource?: string | null;
  address?: string | null;
  neighborhood?: string | null;
  /** El nombre, no el id: con "62" OpenStreetMap no encuentra nada. */
  city?: string | null;
  /** Código ISO del país ("CO"). */
  countryCode?: string | null;
}

export interface PlacePoint {
  point: MapPoint | null;
  /** Marcado en el mapa. Si no, el punto es aproximado. */
  exact: boolean;
  /** Buscando la dirección. */
  loading: boolean;
}

/**
 * Dónde mostrar un lugar: el punto guardado si lo tiene y, si no, lo que
 * OpenStreetMap encuentre con la dirección. Con `null` no busca nada (por
 * ejemplo, mientras el mapa está oculto).
 */
export function usePlacePoint(place: PlaceToLocate | null | undefined): PlacePoint {
  const lat = place?.latitude != null ? Number(place.latitude) : NaN;
  const lng = place?.longitude != null ? Number(place.longitude) : NaN;
  const stored: MapPoint | null =
    Number.isFinite(lat) && Number.isFinite(lng)
      ? { latitude: lat, longitude: lng }
      : null;

  // Una cadena y no el arreglo, para que el efecto no corra en cada render.
  const searchKey =
    place && !stored ? placeSearchQueries(place).join("\n") : "";
  const countryCode = place?.countryCode ?? undefined;

  const [found, setFound] = useState<{ key: string; point: MapPoint | null } | null>(
    null,
  );

  useEffect(() => {
    if (!searchKey) return;
    let cancelled = false;
    findPlace(searchKey.split("\n"), countryCode)
      .catch(() => null)
      .then((point) => {
        if (!cancelled) setFound({ key: searchKey, point });
      });
    return () => {
      cancelled = true;
    };
  }, [searchKey, countryCode]);

  if (stored) {
    return { point: stored, exact: place?.locationSource === "pin", loading: false };
  }
  if (!searchKey) return { point: null, exact: false, loading: false };

  const done = found?.key === searchKey;
  return { point: done ? found.point : null, exact: false, loading: !done };
}
