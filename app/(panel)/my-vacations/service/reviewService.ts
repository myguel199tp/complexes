import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

/**
 * Quién califica sale de la sesión y qué se califica, de la reserva: el
 * backend ya no acepta `userId` ni `hollidayId`.
 */
export interface CreateReviewPayload {
  bookingId: string;
  rating: number;
  comment?: string;
}

// Huésped: califica el lugar de una estadía terminada (POST /api/holliday-review)
export async function createReviewService(payload: CreateReviewPayload) {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/holliday-review`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

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
