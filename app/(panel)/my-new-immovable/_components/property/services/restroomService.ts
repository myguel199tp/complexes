import { restroomResponses } from "./response/restroomResponse";
import { backendError } from "@/app/helpers/backendError";

export async function restroomService(): Promise<restroomResponses[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/restroom`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    throw await backendError(response);
  }

  const data: restroomResponses[] = await response.json();
  return data;
}
