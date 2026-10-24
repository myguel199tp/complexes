import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

export interface HolidayReview {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  /** Solo el nombre de pila: la lista es pública. */
  user?: { name?: string } | null;
  /** Respuesta pública del anfitrión, si la escribió. */
  respuestaAnfitrion?: { texto: string; fecha: string } | null;
}

const API = process.env.NEXT_PUBLIC_API_URL;

export async function getHolidayReviews(
  hollidayId: string,
): Promise<HolidayReview[]> {
  try {
    const res = await fetch(`${API}/api/holliday-review/${hollidayId}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getHolidayAverageRating(
  hollidayId: string,
): Promise<number> {
  try {
    const res = await fetch(
      `${API}/api/holliday-review/average/${hollidayId}`,
      { cache: "no-store" },
    );
    if (!res.ok) return 0;
    const data = await res.json();
    return Number(data) || 0;
  } catch {
    return 0;
  }
}

// Marca una reseña como inapropiada; la empresa decide si se oculta.
export async function reportReviewService(reviewId: string, motivo: string) {
  const res = await fetchWithAuth(`${API}/api/holliday-review/${reviewId}/report`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ motivo }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
    throw new Error(
      typeof message === "string" && message ? message : "No se pudo enviar el reporte",
    );
  }

  return res.json();
}
