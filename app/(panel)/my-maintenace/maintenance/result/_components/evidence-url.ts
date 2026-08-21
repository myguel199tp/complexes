const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * La evidencia capturada con la cámara se guarda en el backend y llega como
 * ruta relativa (`/uploads/maintenance/...`). Los registros anteriores a la
 * captura guardaban un enlace externo escrito a mano: esos se dejan tal cual.
 */
export function buildEvidenceUrl(evidenceUrl: string): string {
  return /^https?:\/\//.test(evidenceUrl)
    ? evidenceUrl
    : `${BASE_URL}${evidenceUrl.startsWith("/") ? "" : "/"}${evidenceUrl}`;
}
