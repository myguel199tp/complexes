import { ShowcaseResponse } from "./types";

/**
 * Promociones anunciables. Es público y sin sesión: lo consumen la portada y
 * la página de demostración.
 */
export async function showcaseService(
  country?: string,
): Promise<ShowcaseResponse> {
  const query = country ? `?country=${encodeURIComponent(country)}` : "";

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/showcase${query}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    },
  );

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  return (await response.json()) as ShowcaseResponse;
}
