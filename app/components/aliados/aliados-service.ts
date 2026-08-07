export interface AliadoB2b {
  id: string;
  businessName: string;
  description?: string;
  logoUrl?: string;
  city?: string;
  country?: string;
  phone?: string;
  /** `null` cuando nadie lo ha calificado; distinto de una nota mínima. */
  ratingAverage?: number | null;
  ratingCount?: number;
}

/** Resuelve el logo del aliado (URL absoluta o archivo subido). */
export function resolveAliadoLogo(logoUrl?: string): string | null {
  if (!logoUrl) return null;
  if (/^https?:\/\//i.test(logoUrl)) return logoUrl;
  const base = process.env.NEXT_PUBLIC_API_URL;
  return `${base}/uploads/${logoUrl.replace(/^.*[\\/]/, "")}`;
}

/**
 * Vitrina pública de comercios B2B ("aliados"). Solo lectura, sin token.
 */
export async function aliadosService(): Promise<AliadoB2b[]> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/comercio/b2b/aliados`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: AliadoB2b[] = await response.json();
  return data;
}
