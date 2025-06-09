import { InmovableinfoResponses } from "./response/inmovableInfoResponse";

export async function inmovableInfoService(): Promise<
  InmovableinfoResponses[]
> {
  const storedUserId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const iduser = String(storedUserId);
  const queryParams = new URLSearchParams({ iduser });

  const url = `${
    process.env.NEXT_PUBLIC_API_URL
  }/api/sales/byuser?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: InmovableinfoResponses[] = await response.json();
  return data;
}
