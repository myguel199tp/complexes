import { amenitiesResponses } from "./response/amenitiesHollidayResponse";
import { backendError } from "@/app/helpers/backendError";

export async function amenitieService(): Promise<amenitiesResponses[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/amanitie`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    throw await backendError(response);
  }

  const data: amenitiesResponses[] = await response.json();
  return data;
}
