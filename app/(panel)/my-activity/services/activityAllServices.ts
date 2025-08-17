import { parseCookies } from "nookies";
import { ActivityResponse } from "./response/activityResponse";

export async function allActivityService(
  conjuntoId: string
): Promise<ActivityResponse[]> {
  const cookies = parseCookies();
  const token = cookies.accessToken;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/activities/allactivites/${conjuntoId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: ActivityResponse[] = await response.json();
  return data;
}
