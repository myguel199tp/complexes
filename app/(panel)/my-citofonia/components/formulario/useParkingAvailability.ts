"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { getParkingAvailability } from "@/app/(panel)/my-parking/services/parkingSpotService";

/**
 * Cupos de visitantes libres, para mostrarlos en el formulario de portería.
 *
 * El vigilante decide si deja entrar el vehículo aquí, no en el inventario, así
 * que el dato tiene que estar en esta pantalla. Se refresca solo cada medio
 * minuto porque otra portería o una salida pueden cambiar el conteo mientras
 * este formulario está abierto.
 *
 * Si el conjunto todavía no ha cargado celdas (`capacity === 0`) no hay nada
 * contra qué comparar y el indicador no se muestra, en vez de anunciar "0
 * disponibles" y bloquear a quien nunca usó el módulo.
 */
export function useParkingAvailability() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  const query = useQuery({
    queryKey: ["parking-availability", conjuntoId],
    queryFn: () => getParkingAvailability(conjuntoId),
    enabled: !!conjuntoId,
    refetchInterval: 30_000,
    // El inventario es opcional: si el endpoint falla, el registro de la visita
    // debe seguir funcionando igual que antes.
    retry: false,
  });

  const visitors = query.data?.visitors;
  const configured = !!visitors && visitors.capacity > 0;

  return {
    configured,
    capacity: visitors?.capacity ?? 0,
    occupied: visitors?.occupied ?? 0,
    available: visitors?.available ?? 0,
    isFull: configured && visitors.available <= 0,
    overCapacity: !!visitors?.overCapacity,
  };
}
