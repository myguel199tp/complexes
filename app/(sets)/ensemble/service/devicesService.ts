import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export type TrustedDevice = {
  id: string;
  deviceId: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  trusted: boolean;
  isActive: boolean;
  createdAt: string;
  lastRefreshedAt: string | null;
  expiresAt: string | null;
};

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/sessions`;

export async function getDevices(): Promise<TrustedDevice[]> {
  const response = await fetchWithAuth(BASE_URL, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("No se pudieron cargar los dispositivos");
  }

  return response.json();
}

export async function revokeDeviceTrust(sessionId: string): Promise<void> {
  const response = await fetchWithAuth(`${BASE_URL}/${sessionId}/trust`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("No se pudo quitar la confianza del dispositivo");
  }
}

/**
 * Etiqueta legible a partir del user-agent. Es una heurística para que el
 * usuario reconozca el dispositivo, no una detección fiable.
 */
export function deviceLabel(userAgent: string | null): string {
  if (!userAgent) return "Dispositivo desconocido";

  const os =
    /Windows/i.test(userAgent) ? "Windows"
    : /Android/i.test(userAgent) ? "Android"
    : /iPhone|iPad|iPod/i.test(userAgent) ? "iOS"
    : /Mac OS X|Macintosh/i.test(userAgent) ? "macOS"
    : /Linux/i.test(userAgent) ? "Linux"
    : "Sistema desconocido";

  // El orden importa: Edge y Opera también incluyen "Chrome" en su UA, y
  // Chrome incluye "Safari".
  const browser =
    /Edg\//i.test(userAgent) ? "Edge"
    : /OPR\//i.test(userAgent) ? "Opera"
    : /Firefox\//i.test(userAgent) ? "Firefox"
    : /Chrome\//i.test(userAgent) ? "Chrome"
    : /Safari\//i.test(userAgent) ? "Safari"
    : "Navegador desconocido";

  return `${browser} · ${os}`;
}
