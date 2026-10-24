import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

const API = process.env.NEXT_PUBLIC_API_URL;

/** Secciones que el anfitrión edita, cada una con su PATCH en el backend. */
export type HollidaySection =
  | "general"
  | "fechas"
  | "unidades"
  | "amenidades"
  | "permisos"
  | "costos"
  | "reglas";

/** El mensaje del backend, no el cuerpo entero. */
async function failure(response: Response, fallback: string): Promise<Error> {
  const body = await response.json().catch(() => ({}));
  const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
  return new Error(typeof message === "string" && message ? message : fallback);
}

/**
 * Las rutas del inmueble pasan por `JwtAuthGuard` sin `SkipConjunto`: a un
 * propietario le exige el conjunto seleccionado.
 */
async function send(
  path: string,
  conjuntoId: string,
  init: RequestInit,
  fallback: string,
) {
  const response = await fetchWithAuth(`${API}/api/hollidays/${path}`, {
    ...init,
    headers: { ...(init.headers ?? {}), "x-conjunto-id": conjuntoId },
  });

  if (!response.ok) throw await failure(response, fallback);
  return response.json();
}

export function updateHollidaySection(
  conjuntoId: string,
  hollidayId: string,
  section: HollidaySection,
  body: Record<string, unknown>,
) {
  return send(
    `${hollidayId}/${section}`,
    conjuntoId,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    "No se pudieron guardar los cambios",
  );
}

/**
 * Las fotos quedan en `keep` más las nuevas. El backend reemplaza las dos
 * listas, así que también se reenvían los videos que ya tiene: sin ellos los
 * borraría.
 */
export function updateHollidayFiles(
  conjuntoId: string,
  hollidayId: string,
  {
    keep,
    files,
    videos,
    videoUrl,
  }: { keep: string[]; files: File[]; videos: string[]; videoUrl?: string },
) {
  const form = new FormData();
  form.append("files", JSON.stringify(keep));
  files.forEach((file) => form.append("files", file));
  form.append("videos", JSON.stringify(videos));
  if (videoUrl !== undefined) form.append("videoUrl", videoUrl);

  return send(
    `${hollidayId}/archivos`,
    conjuntoId,
    { method: "PATCH", body: form },
    "No se pudieron guardar las fotos",
  );
}

// Lo saca de la búsqueda; se reanuda publicando de nuevo.
export function pauseHolliday(conjuntoId: string, hollidayId: string) {
  return send(
    `${hollidayId}/pause`,
    conjuntoId,
    { method: "PATCH" },
    "No se pudo pausar el inmueble",
  );
}

// Queda cancelado; el backend lo rechaza si tiene reservas vigentes.
export function removeHolliday(conjuntoId: string, hollidayId: string) {
  return send(
    hollidayId,
    conjuntoId,
    { method: "DELETE" },
    "No se pudo eliminar el inmueble",
  );
}
