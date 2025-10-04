import { amenitiesUnityResponse } from "./response/amenitiesUnityResponse";

export async function amenitiesUnityService(): Promise<
  amenitiesUnityResponse[]
> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/amanitie-resident`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: amenitiesUnityResponse[] = await response.json();
  return data;
}
