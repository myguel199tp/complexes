import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { PendingGuestReview } from "./response/pendingGuestReviewResponse";

const API = process.env.NEXT_PUBLIC_API_URL;

// Anfitrión: estadías terminadas cuyo huésped aún puede calificar
export async function pendingGuestReviewsService(): Promise<
  PendingGuestReview[]
> {
  const response = await fetchWithAuth(
    `${API}/api/holliday-review/guest/pending`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export interface CreateGuestReviewPayload {
  bookingId: string;
  rating: number;
  comment?: string;
}

// Anfitrión: califica al huésped (POST /api/holliday-review/guest)
export async function createGuestReviewService(
  payload: CreateGuestReviewPayload,
) {
  const response = await fetchWithAuth(`${API}/api/holliday-review/guest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message = Array.isArray(error?.message)
      ? error.message[0]
      : error?.message;
    throw new Error(
      typeof message === "string" ? message : "No se pudo guardar la reseña",
    );
  }

  return response.json();
}
