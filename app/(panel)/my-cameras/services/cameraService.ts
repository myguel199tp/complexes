import {
  CameraResponse,
  CreateCameraRequest,
  StartStreamResponse,
} from "./response/camera";

// Vía el proxy propio: el Bearer lo pone el servidor a partir de la cookie
// httpOnly. Al ser mismo origen, hls.js y <img> mandan la cookie solos.
const BASE = "/api/proxy/api";

export class CameraError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

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

export async function listCameras(
  conjuntoId: string,
): Promise<CameraResponse[]> {
  const res = await fetch(`${BASE}/camera`, {
    method: "GET",
    headers: authHeaders(conjuntoId),
  });
  return handle<CameraResponse[]>(res);
}

export async function createCamera(
  conjuntoId: string,
  data: CreateCameraRequest,
): Promise<CameraResponse> {
  const res = await fetch(`${BASE}/camera`, {
    method: "POST",
    headers: authHeaders(conjuntoId),
    body: JSON.stringify(data),
  });
  return handle<CameraResponse>(res);
}

export async function deleteCamera(
  conjuntoId: string,
  id: string,
): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/camera/${id}`, {
    method: "DELETE",
    headers: authHeaders(conjuntoId),
  });
  return handle<{ message: string }>(res);
}

export async function startStream(
  conjuntoId: string,
  id: string,
): Promise<StartStreamResponse> {
  const res = await fetch(`${BASE}/camera/${id}/stream/start`, {
    method: "POST",
    headers: authHeaders(conjuntoId),
  });
  return handle<StartStreamResponse>(res);
}

export async function stopStream(
  conjuntoId: string,
  id: string,
): Promise<void> {
  await fetch(`${BASE}/camera/${id}/stream/stop`, {
    method: "POST",
    headers: authHeaders(conjuntoId),
    keepalive: true,
  }).catch(() => undefined);
}

/** URL absoluta del playlist HLS a partir de la ruta relativa del backend. */
export function playlistAbsoluteUrl(playlistUrl: string): string {
  return `${BASE}${playlistUrl}`;
}

/**
 * Descarga un snapshot y devuelve un object URL para <img>. Sigue pasando por
 * fetch porque un <img src> no puede enviar la cabecera x-conjunto-id.
 */
export async function fetchSnapshotUrl(
  conjuntoId: string,
  id: string,
): Promise<string> {
  const res = await fetch(`${BASE}/camera/${id}/snapshot`, {
    method: "GET",
    headers: authHeaders(conjuntoId, false),
  });
  if (!res.ok) {
    throw new CameraError("No se pudo capturar la imagen", res.status);
  }
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

/** Cabeceras para hls.js. La autorización va por cookie httpOnly al proxy. */
export function streamAuthHeaders(conjuntoId: string): Record<string, string> {
  return {
    "x-conjunto-id": conjuntoId,
  };
}
