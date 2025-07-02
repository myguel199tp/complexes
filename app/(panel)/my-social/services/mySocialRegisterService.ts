import { parseCookies } from "nookies";
import { SocialResponse } from "./response/socialResponse";

export async function allReservationService(): Promise<SocialResponse[]> {
  const cookies = parseCookies();
  const token = cookies.accessToken;
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/reservation-activity`,
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

  const data: SocialResponse[] = await response.json();
  return data;
}
