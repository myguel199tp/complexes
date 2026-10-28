import { propertyResponses } from "./response/propertyTipesResponse";
import { backendError } from "@/app/helpers/backendError";

export async function propertyTipesService(): Promise<propertyResponses[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/property-type`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    throw await backendError(response);
  }

  const data: propertyResponses[] = await response.json();
  return data;
}
