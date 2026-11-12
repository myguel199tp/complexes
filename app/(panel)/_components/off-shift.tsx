"use client";

import { useQuery } from "@tanstack/react-query";
import { Text } from "complexes-next-components";
import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

/** Roles con horario (los mismos que `SHIFT_ROLES` del backend). */
const SHIFT_ROLES = new Set([
  "porter",
  "cleaner",
  "maintenance",
  "gardener",
  "pool_technician",
  "accountant",
  "messenger",
  "logistics_assistant",
  "community_manager",
  "trainer",
  "event_staff",
]);

interface MyShift {
  hasSchedule: boolean;
  onShift: boolean;
  nextShiftAt: string | null;
}

/**
 * ¿El colaborador está fuera de su turno en el conjunto seleccionado?
 *
 * El backend ya le cierra todo el conjunto fuera de turno (403 `OFF_SHIFT`);
 * esto es para mostrar un solo aviso claro en vez de que cada pantalla falle a
 * su manera. `/staff/me/shift` responde también fuera de turno.
 */
export function useOffShift(roles: string[], conjuntoId: string) {
  const hasShiftRole = roles.some((r) => SHIFT_ROLES.has(r));

  const { data } = useQuery({
    queryKey: ["my_shift", conjuntoId],
    queryFn: async (): Promise<MyShift> => {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/staff/me/shift`,
        { headers: { "x-conjunto-id": conjuntoId } },
      );
      return response.json();
    },
    enabled: hasShiftRole && !!conjuntoId,
    // El turno empieza y termina solo: se vuelve a mirar cada minuto.
    refetchInterval: 60_000,
    retry: false,
  });

  return {
    offShift: !!data && data.hasSchedule && !data.onShift,
    nextShiftAt: data?.nextShiftAt ?? null,
  };
}

const nextShiftFormat = new Intl.DateTimeFormat("es-CO", {
  timeZone: "America/Bogota",
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function OffShiftNotice({ nextShiftAt }: { nextShiftAt: string | null }) {
  return (
    <div className="p-8 text-center">
      <Text size="md" font="bold" className="text-slate-900 dark:text-white">
        Estás fuera de tu turno en este conjunto
      </Text>
      <Text size="sm" className="mt-2 text-slate-600 dark:text-slate-400">
        {nextShiftAt
          ? `Tu próximo turno empieza el ${nextShiftFormat.format(new Date(nextShiftAt))}.`
          : "Habla con la administración si necesitas entrar ahora."}
      </Text>
      <Text size="xs" className="mt-1 text-slate-500 dark:text-slate-500">
        Si te toca cubrir un turno, la administración puede habilitarte un turno
        extra.
      </Text>
    </div>
  );
}
