"use client";

import { mapsUrl, wazeUrl } from "../services/deliveryOrdersService";

/**
 * "Cómo llegar" a un lugar: Maps, Waze y, si hay, el teléfono.
 *
 * Antes la tarjeta del pedido traía la dirección en texto y nada más: en la
 * moto había que copiarla a otra app letra por letra. Con el punto del lugar
 * se abre la navegación directo; sin él, se le pasa la dirección.
 */
export default function NavigateButtons({
  place,
  label,
  phone,
}: {
  place: {
    latitude?: number | null;
    longitude?: number | null;
    address?: string | null;
  };
  label: string;
  phone?: string | null;
}) {
  const maps = mapsUrl(place);
  const waze = wazeUrl(place);

  if (!maps && !waze && !phone) return null;

  const cls =
    "rounded-md border border-white/10 px-2.5 py-1 text-xs text-slate-200 hover:border-cyan-400/40 hover:text-cyan-200";

  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {maps ? (
        <a href={maps} target="_blank" rel="noopener noreferrer" className={cls}>
          🗺️ Maps {label}
        </a>
      ) : null}
      {waze ? (
        <a href={waze} target="_blank" rel="noopener noreferrer" className={cls}>
          🚗 Waze
        </a>
      ) : null}
      {phone ? (
        <a href={`tel:${phone}`} className={cls}>
          📞 Llamar {label}
        </a>
      ) : null}
    </div>
  );
}
