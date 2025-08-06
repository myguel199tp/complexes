import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { HollidayInfoResponses } from "./response/holllidayInfoResponse";

export async function holllidayInfoService(): Promise<HollidayInfoResponses[]> {
  const payload = getTokenPayload();
  const storedUserId = typeof window !== "undefined" ? payload?.id : null;
  const iduser = String(storedUserId);
  const queryParams = new URLSearchParams({ iduser });

  const url = `${
    process.env.NEXT_PUBLIC_API_URL
  }/api/hollidays/byuser?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: HollidayInfoResponses[] = await response.json();
  return data;
}
