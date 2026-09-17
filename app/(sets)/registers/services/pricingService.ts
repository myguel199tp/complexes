import { PricingResponse } from "./response/pricingResponse";

export async function pricingService(
  country: string,
  apartments: number,
  fundador: string,
  billing: string,
  /**
   * Cupón escrito en el cotizador. El backend decide si aplica: aquí sólo se
   * transporta, y un código inválido devuelve la misma cotización de siempre.
   */
  coupon?: string
): Promise<PricingResponse> {
  const params = new URLSearchParams({
    country,
    fundador,
    apartments: String(apartments),
    billing,
  });

  if (coupon) params.set("coupon", coupon);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/pricing/calculate?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: PricingResponse = await response.json();
  return data;
}
