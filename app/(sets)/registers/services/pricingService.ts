import { PricingResponse } from "./response/pricingResponse";

export async function pricingService(
  country: string,
  apartments: number,
  billing: string
): Promise<PricingResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/pricing/calculate?country=${country}&apartments=${apartments}&billing=${billing}`,
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
