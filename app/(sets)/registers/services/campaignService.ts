import { ActiveCampaignsResponse } from "./response/campaignResponse";

/**
 * Consulta pública de promociones. Se usa sólo para decirle al usuario si su
 * cupón sirve y qué promoción le tocó: el precio nunca se arma con esto, lo
 * calcula `pricing/calculate` en el servidor.
 */
export async function activeCampaignsService(params: {
  country: string;
  apartments: number;
  billing: string;
  plan?: string;
  coupon?: string;
}): Promise<ActiveCampaignsResponse> {
  const query = new URLSearchParams({
    country: params.country,
    apartments: String(params.apartments),
    billing: params.billing,
    // Quien cotiza en el registro todavía no es cliente. Es la misma audiencia
    // que fuerza `pricing/calculate`, y si no coincidieran el cupón podría
    // darse por válido aquí y no descontar nada allá.
    audience: "NEW",
  });

  if (params.plan) query.set("plan", params.plan);
  if (params.coupon) query.set("couponCode", params.coupon);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/campaigns/active?${query.toString()}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  return (await response.json()) as ActiveCampaignsResponse;
}
