import { parkingResponses } from "./response/parkingResponse";
import { backendError } from "@/app/helpers/backendError";

export async function parkingService(): Promise<parkingResponses[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/parking`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    throw await backendError(response);
  }

  const data: parkingResponses[] = await response.json();
  return data;
}
