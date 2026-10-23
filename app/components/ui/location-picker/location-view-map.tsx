"use client";

import { useEffect } from "react";
import { Circle, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { MapPoint } from "./location-picker-map";

export interface LocationViewProps {
  point: MapPoint;
  /** Marcado en el mapa. Si no, salió de la dirección: se dibuja la zona. */
  exact: boolean;
  /** Lo que dice el pin al tocarlo. */
  label?: string;
}

/** La zona cuando el punto salió de la dirección: más o menos un barrio. */
const APPROX_RADIUS_M = 400;

/**
 * Dónde queda un lugar, para quien lo está mirando. Ocupa todo el alto del
 * contenedor: el tamaño lo pone quien lo usa.
 */
export default function LocationViewMap({ point, exact, label }: LocationViewProps) {
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

  const position: [number, number] = [point.latitude, point.longitude];
  const coords = `${point.latitude},${point.longitude}`;
  // A una zona aproximada no se le pide ruta: se abre el mapa ahí.
  const mapsUrl = exact
    ? `https://www.google.com/maps/dir/?api=1&destination=${coords}`
    : `https://www.google.com/maps/search/?api=1&query=${coords}`;

  return (
    <div className="relative z-0 h-full w-full">
      <MapContainer
        center={position}
        zoom={exact ? 16 : 15}
        // La rueda del mouse sigue bajando la página; el zoom va con los botones.
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {exact ? (
          <Marker position={position}>{label && <Popup>{label}</Popup>}</Marker>
        ) : (
          <Circle
            center={position}
            radius={APPROX_RADIUS_M}
            pathOptions={{ color: "#0e7490", fillColor: "#0e7490", fillOpacity: 0.15 }}
          />
        )}
      </MapContainer>

      <div className="pointer-events-none absolute right-2 top-2 z-[1000] flex flex-col items-end gap-1.5">
        <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-gray-700 shadow">
          {exact ? "Ubicación exacta" : "Zona aproximada"}
        </span>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto rounded-lg bg-cyan-800 px-3 py-1.5 text-xs font-semibold text-white shadow-lg hover:bg-cyan-900"
        >
          {exact ? "Cómo llegar" : "Abrir en Google Maps"}
        </a>
      </div>
    </div>
  );
}
