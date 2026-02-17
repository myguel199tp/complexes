import { ActivityResponse } from "./response/activityResponse";

export async function allActivityService(
  conjuntoId: string,
): Promise<ActivityResponse[]> {
  const response = await fetch("/api/activity", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-conjunto-id": conjuntoId,
    },
    credentials: "include", // importante
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  return await response.json();
}
