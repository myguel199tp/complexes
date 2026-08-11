"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { getFreeVisitorSpots } from "@/app/(panel)/my-parking/services/parkingSpotService";

/**
 * Celdas de visitantes libres para el selector de portería.
 *
 * La lista se pide al servidor y no se filtra en el cliente porque la
 * disponibilidad cambia con cada registro y cada salida: otra portería puede
 * haber tomado un puesto mientras este formulario está abierto. Por eso también
 * se refresca sola cada medio minuto, igual que el contador de cupos.
 */
export function useVisitorSpots(enabled: boolean) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  const query = useQuery({
    queryKey: ["visitor-free-spots", conjuntoId],
    queryFn: () => getFreeVisitorSpots(conjuntoId),
    enabled: !!conjuntoId && enabled,
    refetchInterval: 30_000,
    // El inventario es opcional: si el endpoint falla, registrar la visita debe
    // seguir funcionando igual que antes.
    retry: false,
  });

  const spots = query.data ?? [];

  return {
    spots,
    options: spots.map((spot) => ({
      value: spot.id,
      label: spot.zone ? `${spot.code} · ${spot.zone}` : spot.code,
    })),
    /** Sin celdas libres el registro sigue, pero queda marcado como sobrecupo. */
    isFull: query.isSuccess && spots.length === 0,
    isLoading: query.isLoading,
  };
}
