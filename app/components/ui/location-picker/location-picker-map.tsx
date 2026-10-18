"use client";

import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export interface MapPoint {
  latitude: number;
  longitude: number;
}

export interface LocationPickerProps {
  /** El pin actual, o `null` si todavía no hay. */
  value: MapPoint | null;
  onChange: (point: MapPoint) => void;
  /** Dónde centrar cuando no hay pin (el centro de la ciudad, por ejemplo). */
  center: MapPoint | null;
  /**
   * Búsquedas para "Buscar la dirección", de la más precisa a la menos: se
   * usa la primera que encuentre algo (ver `placeSearchQueries`). Sin ninguna
   * no se muestra el botón.
   */
  searchQueries?: string[];
  /**
   * Sin pin ni `center`, el nombre de la ciudad para centrar el mapa ahí (sin
   * poner pin). Para formularios que todavía no tienen el centro a mano.
   */
  centerQuery?: string;
  /** Código ISO del país para acotar la búsqueda ("co"). */
  countryCode?: string;
  height?: number;
}

/** Bogotá, para cuando no hay ni pin ni ciudad con qué centrar. */
const FALLBACK_CENTER: MapPoint = { latitude: 4.711, longitude: -74.0721 };

function ClickToPlace({ onChange }: { onChange: (point: MapPoint) => void }) {
  useMapEvents({
    click(event) {
      onChange({ latitude: event.latlng.lat, longitude: event.latlng.lng });
    },
  });
  return null;
}

/** El mapa no se mueve solo cuando cambia `center`: hay que pedírselo. */
function FollowPoint({ point, zoom }: { point: MapPoint; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([point.latitude, point.longitude], Math.max(map.getZoom(), zoom));
  }, [map, point.latitude, point.longitude, zoom]);
  return null;
}

export default function LocationPickerMap({
  value,
  onChange,
  center,
  searchQueries,
  centerQuery,
  countryCode,
  height = 320,
}: LocationPickerProps) {
  const [searching, setSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [focus, setFocus] = useState<MapPoint | null>(null);
  const [cityCenter, setCityCenter] = useState<MapPoint | null>(null);

  const needsCityCenter = !value && !center && !!centerQuery?.trim();

  useEffect(() => {
    if (!needsCityCenter) return;
    let cancelled = false;
    const params = new URLSearchParams({
      q: centerQuery!.trim(),
      format: "json",
      limit: "1",
    });
    if (countryCode) params.set("countrycodes", countryCode.toLowerCase());
    fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`)
      .then((res) => res.json())
      .then((rows: { lat: string; lon: string }[]) => {
        if (!cancelled && rows?.length) {
          setCityCenter({ latitude: +rows[0].lat, longitude: +rows[0].lon });
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [needsCityCenter, centerQuery, countryCode]);

  useEffect(() => {
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });
  }, []);

  const start = value ?? center ?? FALLBACK_CENTER;

  /**
   * Busca la dirección en OpenStreetMap y deja el pin ahí para que la persona
   * lo revise. No se guarda solo: el punto exacto lo confirma quien conoce el
   * lugar, porque las direcciones colombianas casi nunca caen en la placa.
   */
  const queries = (searchQueries ?? []).map((q) => q.trim()).filter(Boolean);

  async function searchAddress() {
    if (!queries.length) return;
    setSearching(true);
    setSearchMessage(null);
    try {
      for (const q of queries) {
        const params = new URLSearchParams({
          q,
          format: "json",
          limit: "1",
          "accept-language": "es",
        });
        if (countryCode) params.set("countrycodes", countryCode.toLowerCase());
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        );
        const rows: { lat: string; lon: string }[] = await res.json();
        if (rows?.length) {
          const point = { latitude: +rows[0].lat, longitude: +rows[0].lon };
          onChange(point);
          setFocus(point);
          setSearchMessage("Revisa el pin y muévelo si no quedó en la entrada.");
          return;
        }
      }
      setSearchMessage("No encontramos esa dirección. Haz clic en el mapa donde queda.");
    } catch {
      setSearchMessage("No pudimos buscar la dirección. Haz clic en el mapa donde queda.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="space-y-2">
      <div
        style={{ height }}
        className="relative z-0 w-full overflow-hidden rounded-xl border border-gray-200"
      >
        <MapContainer
          center={[start.latitude, start.longitude]}
          zoom={value ? 17 : 14}
          className="h-full w-full"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickToPlace onChange={onChange} />
          {focus && <FollowPoint point={focus} zoom={17} />}
          {!value && center && <FollowPoint point={center} zoom={14} />}
          {!value && !center && cityCenter && (
            <FollowPoint point={cityCenter} zoom={13} />
          )}
          {value && (
            <Marker
              position={[value.latitude, value.longitude]}
              draggable
              eventHandlers={{
                dragend(event) {
                  const { lat, lng } = (event.target as L.Marker).getLatLng();
                  onChange({ latitude: lat, longitude: lng });
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-gray-500">
          Haz clic en el mapa donde queda la entrada. Puedes arrastrar el pin.
        </p>
        {queries.length > 0 && (
          <button
            type="button"
            onClick={searchAddress}
            disabled={searching}
            className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {searching ? "Buscando..." : "Buscar la dirección"}
          </button>
        )}
      </div>
      {searchMessage && <p className="text-xs text-gray-600">{searchMessage}</p>}
    </div>
  );
}
