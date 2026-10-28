import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { AvailabilityDay } from "./response/availabilityResponse";
import { backendError } from "@/app/helpers/backendError";

const API = process.env.NEXT_PUBLIC_API_URL;

// Fechas libres (isBooked=false, isBlocked=false) del holiday
export async function getHollidayAvailability(
  hollidayId: string,
): Promise<AvailabilityDay[]> {
  const response = await fetchWithAuth(
    `${API}/api/hollidays/${hollidayId}/availability`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!response.ok) {
    throw await backendError(response);
  }

  return response.json();
}

// Fechas ocupadas o bloqueadas (array de "YYYY-MM-DD")
export async function getHollidayBlockedDates(
  hollidayId: string,
): Promise<string[]> {
  const response = await fetchWithAuth(
    `${API}/api/hollidays/${hollidayId}/blocked-dates`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!response.ok) {
    throw await backendError(response);
  }

  const data = await response.json();
  return Array.isArray(data) ? data.filter((d) => typeof d === "string") : [];
}

// Anfitrión: bloquear fechas seleccionadas (PATCH /hollidays/:id/block-dates)
// La ruta exige el conjunto seleccionado al propietario; sin la cabecera daba 403.
export async function blockHollidayDates(
  hollidayId: string,
  dates: string[],
  conjuntoId: string,
): Promise<AvailabilityDay[]> {
  const response = await fetchWithAuth(
    `${API}/api/hollidays/${hollidayId}/block-dates`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
      body: JSON.stringify({ dates }),
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "No se pudieron bloquear las fechas");
  }

  return response.json();
}

/**
 * Los días que bloqueó el anfitrión: son los únicos que puede desbloquear.
 * Lo apartado por una reserva o vendido en otra plataforma se suelta solo.
 */
export async function getHostBlockedDates(
  hollidayId: string,
  conjuntoId: string,
): Promise<string[]> {
  const response = await fetchWithAuth(
    `${API}/api/hollidays/${hollidayId}/host-blocked-dates`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
    },
  );

  if (!response.ok) {
    throw await backendError(response);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

// Anfitrión: quitar bloqueos suyos (PATCH /hollidays/:id/unblock-dates)
export async function unblockHollidayDates(
  hollidayId: string,
  dates: string[],
  conjuntoId: string,
): Promise<{ desbloqueados: number }> {
  const response = await fetchWithAuth(
    `${API}/api/hollidays/${hollidayId}/unblock-dates`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
      body: JSON.stringify({ dates }),
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "No se pudieron desbloquear las fechas");
  }

  return response.json();
}
