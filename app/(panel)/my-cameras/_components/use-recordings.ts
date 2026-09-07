import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getRecordingAccess,
  getRecordingUsage,
  listRecordingAccessLog,
  listRecordingDays,
  listRecordings,
  requestRecordingOtp,
  revokeRecordingAccess,
  verifyRecordingOtp,
} from "../services/recordingService";
import { RecordingQuery } from "../services/response/recording";

const accessKey = (conjuntoId: string) => ["recording-access", conjuntoId];

/**
 * Estado del desbloqueo.
 *
 * Se refresca cada minuto para que la pantalla se cierre sola cuando expira el
 * acceso, en vez de dejar botones que fallan con 403 al pulsarlos.
 */
export function useRecordingAccess(conjuntoId: string, enabled: boolean) {
  return useQuery({
    queryKey: accessKey(conjuntoId),
    queryFn: () => getRecordingAccess(conjuntoId),
    enabled: enabled && !!conjuntoId,
    refetchInterval: 60_000,
  });
}

export function useRequestRecordingOtp(conjuntoId: string) {
  return useMutation({
    mutationFn: () => requestRecordingOtp(conjuntoId),
  });
}

export function useVerifyRecordingOtp(conjuntoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => verifyRecordingOtp(conjuntoId, code),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: accessKey(conjuntoId) });
    },
  });
}

export function useRevokeRecordingAccess(conjuntoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => revokeRecordingAccess(conjuntoId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: accessKey(conjuntoId) });
    },
  });
}

export function useRecordingsQuery(
  conjuntoId: string,
  query: RecordingQuery,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["recordings", conjuntoId, query],
    queryFn: () => listRecordings(conjuntoId, query),
    enabled: enabled && !!conjuntoId,
  });
}

export function useRecordingDays(
  conjuntoId: string,
  cameraId: string | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["recording-days", conjuntoId, cameraId ?? "all"],
    queryFn: () => listRecordingDays(conjuntoId, cameraId),
    enabled: enabled && !!conjuntoId,
  });
}

/**
 * Consumo del servicio. Su 403 es además la señal de "no contratado" que usan
 * las pantallas, así que no se reintenta: reintentar un permiso denegado no lo
 * cambia y sólo retrasa el mensaje que hay que mostrar.
 */
export function useRecordingUsage(conjuntoId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["recording-usage", conjuntoId],
    queryFn: () => getRecordingUsage(conjuntoId),
    enabled: enabled && !!conjuntoId,
    retry: false,
  });
}

export function useRecordingAccessLog(conjuntoId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["recording-access-log", conjuntoId],
    queryFn: () => listRecordingAccessLog(conjuntoId),
    enabled: enabled && !!conjuntoId,
  });
}
