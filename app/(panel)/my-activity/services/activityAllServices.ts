import { fetchWithAuth } from "@/app/helpers/fetchWithAuth";
import { ActivityResponse } from "./response/activityResponse";
import { backendMessage } from "@/app/helpers/backendError";

export async function allActivityService(
  conjuntoId: string,
): Promise<ActivityResponse[]> {
  const response = await fetchWithAuth(
    `${process.env.NEXT_PUBLIC_API_URL}/api/activities/all-activities`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
      credentials: "include",
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(backendMessage(errorText));
  }

  return await response.json();
}
