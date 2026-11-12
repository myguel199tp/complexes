"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  staffService,
  StaffMember,
  WorkSlot,
} from "../../services/staffService";

export const STAFF_QUERY_KEY = "staff_members";

/** Personal del conjunto con su horario y si está en turno ahora. */
export function useStaffQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useQuery({
    queryKey: [STAFF_QUERY_KEY, conjuntoId],
    queryFn: () => staffService.list(conjuntoId),
    enabled: !!conjuntoId,
    // "En turno" cambia con la hora: se refresca solo cada minuto.
    refetchInterval: 60_000,
  });
}

/** Indexado por relación, para cruzarlo con la tabla de colaboradores. */
export function staffByRelation(
  members: StaffMember[] | undefined,
): Map<string, StaffMember> {
  return new Map((members ?? []).map((m) => [m.relationId, m]));
}

/**
 * Las acciones sobre un colaborador. Todas devuelven el colaborador
 * actualizado; al terminar se refrescan la lista de personal y la tabla de
 * usuarios (que muestra si está activo).
 */
export function useStaffActions() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);

  const done = (message: string) => () => {
    queryClient.invalidateQueries({ queryKey: [STAFF_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: ["query_user_register"] });
    showAlert(message, "success");
  };
  const failed = (error: Error) =>
    showAlert(error.message || "No se pudo completar la acción.", "error");

  const setSchedule = useMutation({
    mutationFn: (args: {
      relationId: string;
      slots: WorkSlot[];
      toleranceMinutes: number;
    }) =>
      staffService.setSchedule(conjuntoId, args.relationId, {
        slots: args.slots,
        toleranceMinutes: args.toleranceMinutes,
      }),
    onSuccess: done("Horario guardado."),
    onError: failed,
  });

  const clearSchedule = useMutation({
    mutationFn: (relationId: string) =>
      staffService.clearSchedule(conjuntoId, relationId),
    onSuccess: done("Horario quitado: ya no tiene restricción de turno."),
    onError: failed,
  });

  const addExtraShift = useMutation({
    mutationFn: (args: {
      relationId: string;
      from: string;
      until: string;
      note?: string;
    }) =>
      staffService.addExtraShift(conjuntoId, args.relationId, {
        from: args.from,
        until: args.until,
        ...(args.note?.trim() ? { note: args.note.trim() } : {}),
      }),
    onSuccess: done("Turno extra agregado."),
    onError: failed,
  });

  const removeExtraShift = useMutation({
    mutationFn: (args: { relationId: string; extraShiftId: string }) =>
      staffService.removeExtraShift(
        conjuntoId,
        args.relationId,
        args.extraShiftId,
      ),
    onSuccess: done("Turno extra quitado."),
    onError: failed,
  });

  const retire = useMutation({
    mutationFn: (args: { relationId: string; reason?: string }) =>
      staffService.retire(conjuntoId, args.relationId, args.reason),
    onSuccess: done("Colaborador retirado del conjunto."),
    onError: failed,
  });

  const reactivate = useMutation({
    mutationFn: (relationId: string) =>
      staffService.reactivate(conjuntoId, relationId),
    onSuccess: done("Colaborador reactivado."),
    onError: failed,
  });

  return {
    setSchedule,
    clearSchedule,
    addExtraShift,
    removeExtraShift,
    retire,
    reactivate,
  };
}
