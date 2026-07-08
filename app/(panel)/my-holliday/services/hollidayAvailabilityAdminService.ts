import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { AvailabilityDay } from "./response/availabilityResponse";

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
    throw new Error(`Error en la solicitud: ${response.statusText}`);
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
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data.filter((d) => typeof d === "string") : [];
}

// Anfitrión: bloquear fechas seleccionadas (PATCH /hollidays/:id/block-dates)
export async function blockHollidayDates(
  hollidayId: string,
  dates: string[],
): Promise<AvailabilityDay[]> {
  const response = await fetchWithAuth(
    `${API}/api/hollidays/${hollidayId}/block-dates`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dates }),
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "No se pudieron bloquear las fechas");
  }

  return response.json();
}
