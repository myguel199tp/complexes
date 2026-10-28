import { antiquityResponses } from "./response/antiquityResponse";
import { backendError } from "@/app/helpers/backendError";

export async function antiquityService(): Promise<antiquityResponses[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/antiquity`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw await backendError(response);
  }

  const data: antiquityResponses[] = await response.json();
  return data;
}
