"use client";

import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { myReservationsService } from "../services/myReservationsService";

/**
 * Mis reservas próximas.
 *
 * La cartelera ya trae las reservas del conjunto y las filtra por usuario en el
 * navegador, pero ese listado no incluye el código de la reserva —y no debería:
 * el código es la llave del QR y no tiene por qué viajar al cliente de todos
 * los vecinos.
 */
export function useMyReservations() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useQuery({
    queryKey: ["my_activity_reservations", conjuntoId],
    queryFn: () => myReservationsService(conjuntoId as string),
    enabled: !!conjuntoId,
  });
}
