import { ShowcaseResponse } from "./types";
import { backendError } from "@/app/helpers/backendError";

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
    throw await backendError(response);
  }

  return (await response.json()) as ShowcaseResponse;
}
