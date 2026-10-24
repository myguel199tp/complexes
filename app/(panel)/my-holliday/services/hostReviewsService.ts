import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";

const API = process.env.NEXT_PUBLIC_API_URL;

export type HostReview = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  autor: string | null;
  /** La empresa la ocultó tras un reporte. */
  oculta: boolean;
  respuestaAnfitrion: { texto: string; fecha: string } | null;
};

async function failure(response: Response, fallback: string) {
  const body = await response.json().catch(() => ({}));
  const message = Array.isArray(body?.message) ? body.message[0] : body?.message;
  return new Error(typeof message === "string" && message ? message : fallback);
}

// Anfitrión: reseñas públicas de su inmueble (GET /holliday-review/host/:id)
export async function hostReviewsService(
  hollidayId: string,
): Promise<HostReview[]> {
  const response = await fetchWithAuth(
    `${API}/api/holliday-review/host/${hollidayId}`,
    { method: "GET", headers: { "Content-Type": "application/json" } },
  );

  if (!response.ok) throw await failure(response, "No se pudieron cargar las reseñas");

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

// Anfitrión: responde en público (POST /holliday-review/:id/reply)
export async function replyReviewService(reviewId: string, texto: string) {
  const response = await fetchWithAuth(
    `${API}/api/holliday-review/${reviewId}/reply`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto }),
    },
  );

  if (!response.ok) throw await failure(response, "No se pudo guardar la respuesta");
  return response.json();
}
