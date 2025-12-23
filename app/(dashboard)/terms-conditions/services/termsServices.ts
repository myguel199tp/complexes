import { TermsConditionResponse } from "./response/termsResponse";

export async function termsService(): Promise<TermsConditionResponse[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/terms`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: TermsConditionResponse[] = await response.json();
  return data;
}
