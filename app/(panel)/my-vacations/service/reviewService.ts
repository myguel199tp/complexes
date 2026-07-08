import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export interface CreateReviewPayload {
  rating: number;
  comment?: string;
  hollidayId: string;
  userId: string;
}

// Crear reseña de un holiday (POST /api/holliday-review)
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
    throw new Error(error.message || "No se pudo guardar la reseña");
  }

  return response.json();
}
