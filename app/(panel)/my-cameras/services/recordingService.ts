import { CameraError } from "./cameraService";
import {
  RecordingAccessLogResponse,
  RecordingAccessResponse,
  RecordingDay,
  RecordingListResponse,
  RecordingQuery,
  RecordingUsageResponse,
  RequestOtpResponse,
  VerifyOtpResponse,
} from "./response/recording";

// Mismo proxy que el vivo: el Bearer lo pone el servidor desde la cookie
// httpOnly, así que el navegador nunca ve el token.
const BASE = "/api/proxy/api";

function authHeaders(conjuntoId: string, json = true): HeadersInit {
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    "x-conjunto-id": conjuntoId,
  };
}

async function handle<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new CameraError(
      (body as { message?: string }).message || "Error en la solicitud",
      res.status,
    );
  }
  return body as T;
}

// ----------------- desbloqueo -----------------

export async function getRecordingAccess(
  conjuntoId: string,
): Promise<RecordingAccessResponse> {
  const res = await fetch(`${BASE}/camera/recordings/access`, {
    method: "GET",
    headers: authHeaders(conjuntoId),
  });
  return handle<RecordingAccessResponse>(res);
}

export async function requestRecordingOtp(
  conjuntoId: string,
): Promise<RequestOtpResponse> {
  const res = await fetch(`${BASE}/camera/recordings/access/otp`, {
    method: "POST",
    headers: authHeaders(conjuntoId),
  });
  return handle<RequestOtpResponse>(res);
}

export async function verifyRecordingOtp(
  conjuntoId: string,
  code: string,
): Promise<VerifyOtpResponse> {
  const res = await fetch(`${BASE}/camera/recordings/access/verify`, {
    method: "POST",
    headers: authHeaders(conjuntoId),
    body: JSON.stringify({ code }),
  });
  return handle<VerifyOtpResponse>(res);
}

export async function revokeRecordingAccess(
  conjuntoId: string,
): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/camera/recordings/access/revoke`, {
    method: "POST",
    headers: authHeaders(conjuntoId),
  });
  return handle<{ message: string }>(res);
}

// ----------------- consulta -----------------

export async function listRecordings(
  conjuntoId: string,
  query: RecordingQuery = {},
): Promise<RecordingListResponse> {
  const params = new URLSearchParams();
  if (query.cameraId) params.set("cameraId", query.cameraId);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (query.limit !== undefined) params.set("limit", String(query.limit));
  if (query.offset !== undefined) params.set("offset", String(query.offset));

  const qs = params.toString();
  const res = await fetch(`${BASE}/camera/recordings${qs ? `?${qs}` : ""}`, {
    method: "GET",
    headers: authHeaders(conjuntoId),
  });
  return handle<RecordingListResponse>(res);
}

export async function listRecordingDays(
  conjuntoId: string,
  cameraId?: string,
): Promise<RecordingDay[]> {
  const qs = cameraId ? `?cameraId=${cameraId}` : "";
  const res = await fetch(`${BASE}/camera/recordings/days${qs}`, {
    method: "GET",
    headers: authHeaders(conjuntoId),
  });
  return handle<RecordingDay[]>(res);
}

export async function getRecordingUsage(
  conjuntoId: string,
): Promise<RecordingUsageResponse> {
  const res = await fetch(`${BASE}/camera/recordings/usage`, {
    method: "GET",
    headers: authHeaders(conjuntoId),
  });
  return handle<RecordingUsageResponse>(res);
}

export async function listRecordingAccessLog(
  conjuntoId: string,
  limit = 50,
): Promise<RecordingAccessLogResponse> {
  const res = await fetch(
    `${BASE}/camera/recordings/access-log?limit=${limit}`,
    { method: "GET", headers: authHeaders(conjuntoId) },
  );
  return handle<RecordingAccessLogResponse>(res);
}

// ----------------- reproducción -----------------

/**
 * Descarga el MP4 y devuelve un object URL para el `<video>`.
 *
 * No se apunta el `<video src>` directo al backend porque la etiqueta no puede
 * mandar la cabecera `x-conjunto-id`, igual que ya pasa con el snapshot del
 * vivo. El precio es perder el salto dentro del video —se descarga el segmento
 * entero antes de reproducir—, asumible porque cada segmento dura minutos.
 *
 * Quien llame debe hacer `URL.revokeObjectURL` al cambiar de clip.
 */
export async function fetchRecordingUrl(
  conjuntoId: string,
  id: string,
): Promise<string> {
  const res = await fetch(`${BASE}/camera/recordings/${id}/play`, {
    method: "GET",
    headers: authHeaders(conjuntoId, false),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new CameraError(
      (body as { message?: string }).message ||
        "No se pudo cargar la grabación",
      res.status,
    );
  }

  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
