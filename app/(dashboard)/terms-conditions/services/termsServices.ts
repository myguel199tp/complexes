import { TermsConditionResponse } from "./response/termsResponse";
import { backendError } from "@/app/helpers/backendError";

export async function termsService(): Promise<TermsConditionResponse[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/terms`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw await backendError(response);
  }

  const data: TermsConditionResponse[] = await response.json();
  return data;
}
