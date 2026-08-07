"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { getParkingSpots } from "./parkingSpotService";

/**
 * Celdas libres y en servicio del conjunto, para los formularios donde se
 * registra un vehículo.
 *
 * Antes esos formularios pedían el "número de asignación" como texto libre, así
 * que se podían inventar celdas inexistentes o repetir una ya ocupada. Aquí
 * solo se ofrecen celdas reales.
 *
 * `extraSpot` deja visible la celda que el vehículo ya tiene asignada, que por
 * definición no aparece en el listado de libres y si no se agregaría el select
 * se mostraría vacío al editar.
 */
export function useAvailableSpots(
  extraSpot?: { id: string; code: string } | null,
) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  const query = useQuery({
    queryKey: ["parking-spots-free", conjuntoId],
    queryFn: () => getParkingSpots(conjuntoId, { assigned: false }),
    enabled: !!conjuntoId,
    // El inventario es opcional: si falla, el registro del residente no se cae.
    retry: false,
  });

  const options = useMemo(() => {
    const libres = (query.data ?? [])
      .filter((s) => s.isActive && s.type !== "visitor")
      .map((s) => ({
        value: s.id,
        label: s.zone ? `${s.code} · ${s.zone}` : s.code,
      }));

    if (extraSpot && !libres.some((o) => o.value === extraSpot.id)) {
      libres.unshift({ value: extraSpot.id, label: extraSpot.code });
    }

    return libres;
  }, [query.data, extraSpot]);

  return {
    options,
    isLoading: query.isLoading,
    /** El conjunto todavía no cargó su inventario de celdas. */
    isEmpty: !query.isLoading && options.length === 0,
  };
}
