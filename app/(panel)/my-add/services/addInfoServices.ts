import { AddResponses } from "./response/addResponse";

// Puedes eliminar Filters si ya no necesitas otros filtros dinámicos.
export async function addInfoService(): Promise<AddResponses[]> {
  const storedUserId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const iduser = String(storedUserId);
  const queryParams = new URLSearchParams({ iduser });

  const url = `${
    process.env.NEXT_PUBLIC_API_URL
  }/api/file/byuser?${queryParams.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data: AddResponses[] = await response.json();
  return data;
}
