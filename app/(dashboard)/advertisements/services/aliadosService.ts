export interface AliadoB2b {
  id: string;
  businessName: string;
  description?: string;
  logoUrl?: string;
  city?: string;
  country?: string;
  phone?: string;
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
