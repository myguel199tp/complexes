import { stratumResponses } from "./response/stratumResponse";
import { backendError } from "@/app/helpers/backendError";

export async function stratumService(): Promise<stratumResponses[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/stratum`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    throw await backendError(response);
  }

  const data: stratumResponses[] = await response.json();
  return data;
}
